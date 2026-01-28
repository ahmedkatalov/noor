import { useMemo, useState } from "react";
import { apiGet } from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";

export default function BottomCartBar() {
  // ⚠️ clearCart может называться иначе, поэтому берём безопасно
  const cart = useCart();
  const items = cart?.items || {};
  const clearCart = cart?.clearCart || cart?.resetCart || cart?.clear || null;

  const [settings, setSettings] = useState(null);
  const [open, setOpen] = useState(false);

  // кол-во товаров
  const count = useMemo(() => {
    return Object.values(items).reduce((s, it) => s + (it.qty || 0), 0);
  }, [items]);

  // сумма заказа
  const total = useMemo(() => {
    return Object.values(items).reduce(
      (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0),
      0
    );
  }, [items]);

  // подгрузка настроек (номер whatsapp)
  async function loadSettings() {
    if (settings) return settings;
    const s = await apiGet("/api/settings");
    setSettings(s || null);
    return s || null;
  }

  // строгий текст без смайликов
  function buildText(orderType) {
    const now = new Date();
    const dt = now.toLocaleString("ru-RU");

    const lines = [];
    lines.push("NOOR COFFEE");
    lines.push("Новый заказ");
    lines.push("");
    lines.push(`Время: ${dt}`);
    lines.push(`Тип: ${orderType}`);
    lines.push("");
    lines.push("--------------------------------");
    lines.push("Состав заказа:");

    Object.values(items).forEach((it) => {
      const price = Number(it.price) || 0;
      const qty = Number(it.qty) || 0;
      const sum = price * qty;

      lines.push(`${it.name} x${qty} = ${sum} ₽`);
    });

    lines.push("--------------------------------");
    lines.push(`Итого: ${total} ₽`);
    lines.push("");
    lines.push("Подтвердите заказ, пожалуйста.");

    return encodeURIComponent(lines.join("\n"));
  }

  async function goWhatsApp(orderType) {
    const s = await loadSettings();

    const phone = s?.whatsapp_phone;
    if (!phone) {
      alert("WhatsApp номер не указан в настройках. Зайди в админку и добавь номер.");
      return;
    }

    const text = buildText(orderType);
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, "_blank");

    setOpen(false);

    // ✅ очищаем корзину только если функция существует
    if (typeof clearCart === "function") {
      clearCart();
    }
  }

  if (count === 0) return null;

  return (
    <>
      {/* Bottom bar */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
        <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-black/40 backdrop-blur-xl shadow-2xl p-3 flex items-center justify-between gap-3">
          <div className="text-white">
            <div className="font-bold">{count} шт</div>
            <div className="text-white/70 text-sm">{total} ₽</div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="px-4 py-3 rounded-2xl bg-white text-black font-extrabold shadow hover:scale-[1.02] active:scale-[0.98] transition"
          >
            Оформить
          </button>
        </div>
      </div>

      {/* Modal choose order type */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl p-5 text-white">
            <div className="text-xl font-extrabold">Тип заказа</div>
            <div className="text-white/70 text-sm mt-2">
              Выбери как хочешь получить заказ
            </div>

            <div className="mt-5 grid gap-3">
              <button
                className="w-full py-3 rounded-2xl bg-white text-black font-bold hover:scale-[1.01] transition"
                onClick={() => goWhatsApp("Самовывоз")}
              >
                Самовывоз
              </button>

              <button
                className="w-full py-3 rounded-2xl bg-white text-black font-bold hover:scale-[1.01] transition"
                onClick={() => goWhatsApp("Доставка")}
              >
                Доставка
              </button>

              <button
                className="w-full py-3 rounded-2xl bg-white text-black font-bold hover:scale-[1.01] transition"
                onClick={() => goWhatsApp("Буду тут")}
              >
                Буду тут
              </button>
            </div>

            <button
              className="mt-4 w-full py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/15 transition"
              onClick={() => setOpen(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </>
  );
}
