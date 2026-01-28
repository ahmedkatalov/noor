import React, { useMemo, useCallback, useState } from "react";
import { API_URL } from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";

function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const cart = useCart();
  const item = cart?.items?.[product.id] || null;

  const [open, setOpen] = useState(false);

  const img = useMemo(() => {
    return product.image_url ? `${API_URL}${product.image_url}` : "";
  }, [product.image_url]);

  const onAdd = useCallback(() => {
    cart.add({ id: product.id, name: product.name, price: product.price });
  }, [cart, product.id, product.name, product.price]);

  const onInc = useCallback(() => {
    cart.inc(product.id);
  }, [cart, product.id]);

  const onDec = useCallback(() => {
    cart.dec(product.id);
  }, [cart, product.id]);

  const hasDetails = Boolean((product.description || "").trim());

  return (
    <>
      {/* Card */}
      <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur shadow-xl overflow-hidden hover:bg-white/[0.13] transition">
        {/* image */}
        <div className="relative w-full aspect-[4/3] bg-white/10">
          {img ? (
            <img
              src={img}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
              Нет фото
            </div>
          )}

          {/* qty badge */}
          {item?.qty > 0 && (
            <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/60 border border-white/20 text-white text-xs">
              {item.qty}
            </div>
          )}
        </div>

        {/* content */}
        <div className="p-3">
          {/* name + link */}
          <div className="flex items-start justify-between gap-3">
            <div className="text-white font-bold text-sm md:text-base leading-tight">
              {product.name}
            </div>

            {/* ✅ вместо "Описание" -> "Подробнее" */}
            {hasDetails ? (
              <button
                onClick={() => setOpen(true)}
                className="text-xs text-white/80 hover:text-white transition"
              >
                Подробнее
                <div className="h-[1px] bg-white/40 mt-1" />
              </button>
            ) : (
              <div className="text-xs text-white/40">&nbsp;</div>
            )}
          </div>

          {/* price */}
          <div className="mt-2 text-white font-extrabold text-sm md:text-base">
            {product.price} ₽
          </div>

          {/* actions */}
          <div className="mt-3">
            {!item ? (
              <button
                className="w-full py-2 rounded-xl bg-white text-black font-semibold text-xs md:text-sm transition hover:scale-[1.01]"
                onClick={onAdd}
              >
                В корзину
              </button>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <button
                  className="w-10 h-10 rounded-xl bg-white/15 text-white font-bold transition hover:bg-white/20"
                  onClick={onDec}
                >
                  –
                </button>

                <div className="flex-1 text-center py-2 rounded-xl bg-white text-black font-extrabold text-lg">
                  {item.qty}
                </div>

                <button
                  className="w-10 h-10 rounded-xl bg-white/15 text-white font-bold transition hover:bg-white/20"
                  onClick={onInc}
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
          <div className="w-full aspect-[4/3] bg-white/10">
            {img ? (
              <img src={img} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                Нет фото
              </div>
            )}
          </div>

          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 border border-white/20 text-white font-bold hover:bg-black/70 transition"
          >
            ✕
          </button>
        </div>

        <div className="p-5 text-white">
          <div className="text-xl font-extrabold">{product.name}</div>

          <div className="text-white/70 mt-2 text-sm leading-relaxed">
            {product.description || "Информация отсутствует."}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-lg font-extrabold">{product.price} ₽</div>

            {!item ? (
              <button
                className="px-5 py-3 rounded-2xl bg-white text-black font-bold hover:scale-[1.01] transition"
                onClick={onAdd}
              >
                Добавить
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  className="w-10 h-10 rounded-xl bg-white/15 text-white font-bold hover:bg-white/20 transition"
                  onClick={onDec}
                >
                  –
                </button>
                <div className="min-w-[46px] text-center px-4 py-2 rounded-xl bg-white text-black font-extrabold">
                  {item.qty}
                </div>
                <button
                  className="w-10 h-10 rounded-xl bg-white/15 text-white font-bold hover:bg-white/20 transition"
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
