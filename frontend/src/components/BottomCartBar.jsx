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
  const brand = (settings?.brand_name || "Noor Coffee").trim() || "Noor Coffee";

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

  return (
    <>
      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-safe pointer-events-none">
        <div className="w-full max-w-xl mb-3 rounded-2xl border border-white/15 bg-zinc-900/70 backdrop-blur-xl shadow-2xl p-3 flex items-center justify-between gap-3 pointer-events-auto animate-fade-up">
          <div className="text-white">
            <div className="font-extrabold leading-tight">
              {count} {count === 1 ? "товар" : count < 5 ? "товара" : "товаров"}
            </div>
            <div className="text-amber-300 text-sm font-semibold">
              {total} {currency}
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold shadow-lg shadow-amber-500/25 hover:from-amber-300 hover:to-amber-400 active:scale-[0.97] transition"
          >
            Оформить
          </button>
        </div>
      </div>

      {/* Modal: review cart + choose order type */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />

          <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/15 bg-zinc-900/90 backdrop-blur-2xl shadow-2xl text-white max-h-[88dvh] flex flex-col animate-fade-up pb-safe">
            <div className="flex items-center justify-between p-5 pb-3 border-b border-white/10">
              <div>
                <div className="text-xl font-extrabold">Ваш заказ</div>
                <div className="text-white/60 text-sm">
                  {count} шт · {total} {currency}
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/15 transition"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>

            {/* items list */}
            <div className="overflow-y-auto px-5 py-3 space-y-2">
              {list.map((it) => (
                <div key={it.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{it.name}</div>
                    <div className="text-white/60 text-xs">
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

            {/* order type */}
            <div className="p-5 pt-3 border-t border-white/10">
              <div className="text-white/70 text-sm mb-3">Как получить заказ?</div>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] transition"
                  onClick={() => goWhatsApp("Самовывоз")}
                >
                  Самовывоз
                </button>
                <button
                  className="w-full py-3 rounded-2xl bg-white/10 border border-white/15 font-bold hover:bg-white/15 active:scale-[0.98] transition"
                  onClick={() => goWhatsApp("Доставка")}
                >
                  Доставка
                </button>
                <button
                  className="w-full py-3 rounded-2xl bg-white/10 border border-white/15 font-bold hover:bg-white/15 active:scale-[0.98] transition"
                  onClick={() => goWhatsApp("Буду тут")}
                >
                  Буду тут
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
