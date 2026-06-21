import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api/client.js";
import { useCart } from "../context/cart-context.js";

export default function BottomCartBar() {
  const cart = useCart();
  const items = cart?.items;
  const clearCart = cart?.clear || cart?.clearCart || cart?.resetCart || null;

  const [settings, setSettings] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    apiGet("/api/settings").then((s) => setSettings(s || null)).catch(() => {});
  }, []);

  const currency = settings?.currency || "₽";
  const brand = (settings?.brand_name || "Noor Coffe").trim() || "Noor Coffe";

  const list = useMemo(() => Object.values(items || {}), [items]);

  const count = useMemo(
    () => list.reduce((s, it) => s + (it.qty || 0), 0),
    [list]
  );

  const total = useMemo(
    () => list.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0),
    [list]
  );

  function buildText(orderType) {
    const dt = new Date().toLocaleString("ru-RU");

    const lines = [];
    lines.push(brand.toUpperCase());
    lines.push("Новый заказ");
    lines.push("");
    lines.push(`Время: ${dt}`);
    lines.push(`Тип: ${orderType}`);
    lines.push("");
    lines.push("--------------------------------");
    lines.push("Состав заказа:");

    list.forEach((it) => {
      const sum = (Number(it.price) || 0) * (Number(it.qty) || 0);
      lines.push(`${it.name} x${it.qty} = ${sum} ${currency}`);
    });

    lines.push("--------------------------------");
    lines.push(`Итого: ${total} ${currency}`);
    lines.push("");
    lines.push("Подтвердите заказ, пожалуйста.");

    return encodeURIComponent(lines.join("\n"));
  }

  function goWhatsApp(orderType) {
    const phone = settings?.whatsapp_phone;
    if (!phone) {
      alert("WhatsApp номер не указан в настройках. Зайдите в админку и добавьте номер.");
      return;
    }

    const url = `https://wa.me/${phone}?text=${buildText(orderType)}`;
    window.open(url, "_blank");

    setOpen(false);
    if (typeof clearCart === "function") clearCart();
  }

  if (count === 0) return null;

  const plural = count === 1 ? "товар" : count < 5 ? "товара" : "товаров";

  return (
    <>
      {/* Затемнение фона, когда корзина раскрыта */}
      {open && (
        <div
          className="fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 z-[60] flex justify-center px-4 pb-safe pointer-events-none">
        <div className="w-full max-w-xl mb-3 pointer-events-auto">
          {/* Раскрывающаяся вверх корзина */}
          {open && (
            <div className="mb-2 rounded-3xl border border-white/15 bg-zinc-900/95 backdrop-blur-2xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[70dvh] animate-fade-up">
              <div className="flex items-center justify-between p-4 pb-3 border-b border-white/10">
                <div>
                  <div className="text-lg font-extrabold">Ваш заказ</div>
                  <div className="text-white/55 text-sm">
                    {count} шт · {total} {currency}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {typeof clearCart === "function" && (
                    <button
                      onClick={() => clearCart()}
                      className="text-xs px-3 py-1.5 rounded-lg border border-white/15 text-white/70 hover:bg-white/10 transition"
                    >
                      Очистить
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 transition"
                    aria-label="Закрыть"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Список товаров */}
              <div className="overflow-y-auto px-4 py-3 space-y-2">
                {list.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{it.name}</div>
                      <div className="text-white/55 text-xs">
                        {it.price} {currency}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => cart.dec(it.id)}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-lg font-bold transition"
                      >
                        −
                      </button>
                      <span className="min-w-7 text-center font-extrabold">{it.qty}</span>
                      <button
                        onClick={() => cart.inc(it.id)}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-lg font-bold transition"
                      >
                        +
                      </button>
                    </div>

                    <div className="w-16 text-right font-bold shrink-0">
                      {(Number(it.price) || 0) * (Number(it.qty) || 0)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Тип заказа */}
              <div className="p-4 pt-3 border-t border-white/10">
                <div className="text-white/65 text-sm mb-2.5">Как получить заказ?</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    className="py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] transition"
                    onClick={() => goWhatsApp("Самовывоз")}
                  >
                    Самовывоз
                  </button>
                  <button
                    className="py-3 rounded-2xl bg-white/10 border border-white/15 font-bold hover:bg-white/15 active:scale-[0.98] transition"
                    onClick={() => goWhatsApp("Доставка")}
                  >
                    Доставка
                  </button>
                  <button
                    className="py-3 rounded-2xl bg-white/10 border border-white/15 font-bold hover:bg-white/15 active:scale-[0.98] transition"
                    onClick={() => goWhatsApp("Буду тут")}
                  >
                    Буду тут
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Нижняя панель: тап по составу раскрывает корзину вверх */}
          <div className="rounded-2xl border border-white/15 bg-zinc-900/80 backdrop-blur-xl shadow-2xl p-3 flex items-center justify-between gap-3 animate-fade-up">
            <button
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="flex items-center gap-3 flex-1 min-w-0 text-left active:scale-[0.99] transition"
            >
              <span className="grid place-items-center w-9 h-9 rounded-xl bg-white/10 shrink-0 text-white">
                <svg
                  viewBox="0 0 24 24"
                  className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 15l6-6 6 6" />
                </svg>
              </span>
              <span className="min-w-0">
                <span className="block font-extrabold leading-tight text-white">
                  {count} {plural}
                </span>
                <span className="block text-amber-300 text-sm font-semibold">
                  {total} {currency}
                </span>
              </span>
            </button>

            <button
              onClick={() => setOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/25 hover:from-amber-300 hover:to-amber-400 active:scale-[0.97] transition shrink-0"
            >
              Оформить
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
