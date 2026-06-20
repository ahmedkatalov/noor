import React, { useMemo, useCallback, useState } from "react";
import { API_URL } from "../api/client.js";
import { useCart } from "../context/cart-context.js";

function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-zinc-900/80 backdrop-blur-2xl shadow-2xl overflow-hidden animate-pop-in">
        {children}
      </div>
    </div>
  );
}

function ProductCard({ product, currency = "₽" }) {
  const cart = useCart();
  const item = cart?.items?.[product.id] || null;

  const [open, setOpen] = useState(false);

  const img = useMemo(() => {
    return product.image_url ? `${API_URL}${product.image_url}` : "";
  }, [product.image_url]);

  const unavailable = product.is_available === false;

  const onAdd = useCallback(() => {
    if (unavailable) return;
    cart.add({ id: product.id, name: product.name, price: product.price });
  }, [cart, product.id, product.name, product.price, unavailable]);

  const onInc = useCallback(() => cart.inc(product.id), [cart, product.id]);
  const onDec = useCallback(() => cart.dec(product.id), [cart, product.id]);

  const hasDetails = Boolean((product.description || "").trim());

  return (
    <>
      {/* Card */}
      <div
        className={[
          "group rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur shadow-lg overflow-hidden transition",
          unavailable ? "opacity-75" : "hover:bg-white/[0.11] hover:border-white/20 hover:-translate-y-0.5",
        ].join(" ")}
      >
        {/* image */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative block w-full aspect-square bg-white/5 overflow-hidden text-left"
        >
          {img ? (
            <img
              src={img}
              alt={product.name}
              loading="lazy"
              className={[
                "absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105",
                unavailable ? "grayscale" : "",
              ].join(" ")}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/30 text-3xl">☕️</div>
          )}

          {/* qty badge */}
          {item?.qty > 0 && (
            <div className="absolute top-2 right-2 min-w-7 h-7 px-2 flex items-center justify-center rounded-full bg-amber-500 text-black text-xs font-extrabold shadow">
              {item.qty}
            </div>
          )}

          {/* unavailable overlay */}
          {unavailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="px-3 py-1.5 rounded-full bg-black/70 border border-white/20 text-white text-xs font-semibold">
                Нет в наличии
              </span>
            </div>
          )}
        </button>

        {/* content */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-bold text-sm md:text-base leading-tight line-clamp-2">
              {product.name}
            </h3>

            {hasDetails && (
              <button
                onClick={() => setOpen(true)}
                className="shrink-0 text-[11px] text-amber-300/90 hover:text-amber-200 transition mt-0.5"
              >
                Подробнее
              </button>
            )}
          </div>

          {/* price */}
          <div className="mt-2 text-white font-extrabold text-base md:text-lg">
            {product.price} {currency}
          </div>

          {/* actions */}
          <div className="mt-3">
            {unavailable ? (
              <button
                disabled
                className="w-full py-2.5 rounded-xl bg-white/10 text-white/50 font-semibold text-xs md:text-sm cursor-not-allowed"
              >
                Недоступно
              </button>
            ) : !item ? (
              <button
                className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs md:text-sm transition hover:bg-amber-300 active:scale-[0.98]"
                onClick={onAdd}
              >
                В корзину
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="w-10 h-10 shrink-0 rounded-xl bg-white/15 text-white text-xl font-bold transition hover:bg-white/25 active:scale-95"
                  onClick={onDec}
                  aria-label="Убрать один"
                >
                  −
                </button>

                <div className="flex-1 text-center py-2 rounded-xl bg-amber-500 text-black font-extrabold text-lg">
                  {item.qty}
                </div>

                <button
                  className="w-10 h-10 shrink-0 rounded-xl bg-white/15 text-white text-xl font-bold transition hover:bg-white/25 active:scale-95"
                  onClick={onInc}
                  aria-label="Добавить один"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="relative">
          <div className="w-full aspect-[4/3] bg-white/5">
            {img ? (
              <img src={img} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30 text-4xl">☕️</div>
            )}
          </div>

          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 border border-white/20 text-white font-bold hover:bg-black/70 transition"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="p-5 text-white">
          <h3 className="text-xl font-extrabold">{product.name}</h3>

          <p className="text-white/70 mt-2 text-sm leading-relaxed">
            {product.description || "Информация отсутствует."}
          </p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="text-2xl font-extrabold">
              {product.price} {currency}
            </div>

            {unavailable ? (
              <span className="px-4 py-2 rounded-2xl bg-white/10 text-white/60 font-semibold text-sm">
                Нет в наличии
              </span>
            ) : !item ? (
              <button
                className="px-5 py-3 rounded-2xl bg-white text-black font-bold hover:bg-amber-300 active:scale-[0.98] transition"
                onClick={onAdd}
              >
                Добавить
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="w-10 h-10 rounded-xl bg-white/15 text-white text-xl font-bold hover:bg-white/25 transition"
                  onClick={onDec}
                >
                  −
                </button>
                <div className="min-w-[46px] text-center px-4 py-2 rounded-xl bg-amber-500 text-black font-extrabold">
                  {item.qty}
                </div>
                <button
                  className="w-10 h-10 rounded-xl bg-white/15 text-white text-xl font-bold hover:bg-white/25 transition"
                  onClick={onInc}
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

export default React.memo(ProductCard);
