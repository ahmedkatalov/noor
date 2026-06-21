import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, API_URL } from "../api/client.js";
import { resolveBackground } from "../theme.js";
import Filters from "../components/Filters.jsx";
import ProductCard from "../components/ProductCard.jsx";
import BottomCartBar from "../components/BottomCartBar.jsx";

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [catId, setCatId] = useState(null);
  const [subId, setSubId] = useState(null);

  useEffect(() => {
    Promise.all([
      apiGet("/api/products").then((p) => setProducts(Array.isArray(p) ? p : [])),
      apiGet("/api/settings").then((s) => setSettings(s || null)),
      apiGet("/api/categories").then((c) => setCategories(Array.isArray(c) ? c : [])),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = Array.isArray(products) ? products : [];
    if (catId) list = list.filter((p) => Number(p.category_id) === Number(catId));
    if (subId) list = list.filter((p) => Number(p.subcategory_id) === Number(subId));
    return list;
  }, [products, catId, subId]);

  const { style: bgStyle, isImage } = resolveBackground(settings?.menu_background);
  const brand = (settings?.brand_name || "Noor Coffee").trim() || "Noor Coffee";
  const currency = settings?.currency || "₽";

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden pb-28">
      <div
        className="fixed inset-0 bg-cover bg-center scale-[1.05]"
        style={bgStyle}
      />
      <div
        className={`fixed inset-0 ${
          isImage
            ? "bg-gradient-to-b from-black/70 via-black/45 to-black/90"
            : "bg-black/30"
        }`}
      />

      <div className="relative z-10 min-h-[100dvh] flex justify-center">
        <div className="w-full max-w-6xl px-4 py-5">
          {/* sticky header */}
          <header className="sticky top-0 z-20 -mx-4 px-4 pt-safe pb-3 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <Link to="/" className="flex items-center gap-3 min-w-0 group">
                {settings?.logo_url ? (
                  <img
                    src={`${API_URL}${settings.logo_url}`}
                    alt={brand}
                    className="w-11 h-11 rounded-xl object-cover border border-white/20 shadow shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                    ☕️
                  </div>
                )}

                <div className="text-white leading-tight min-w-0">
                  <div className="text-lg md:text-2xl font-extrabold tracking-tight drop-shadow truncate">
                    {brand}
                  </div>
                  <div className="text-white/60 text-xs md:text-sm">Выбирай — добавляй — оформляй</div>
                </div>
              </Link>

              <span className="hidden sm:inline-flex shrink-0 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-sm font-semibold">
                Меню
              </span>
            </div>

            {/* filters */}
            <div className="mt-4 rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-xl shadow-lg p-3">
              <Filters
                categories={categories}
                selectedCategoryId={catId}
                selectedSubcategoryId={subId}
                onChangeCategory={setCatId}
                onChangeSubcategory={setSubId}
              />
            </div>
          </header>

          {/* products */}
          <main className="mt-5">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white/[0.06] border border-white/10 overflow-hidden animate-pulse"
                  >
                    <div className="aspect-square bg-white/10" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-white/10 rounded" />
                      <div className="h-3 w-1/2 bg-white/10 rounded" />
                      <div className="h-9 bg-white/10 rounded-xl mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-16 text-center text-white/60">
                <div className="text-5xl mb-3">🍽️</div>
                Пока нет товаров в этой категории.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} currency={currency} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <BottomCartBar />
    </div>
  );
}
