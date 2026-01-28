import { useEffect, useMemo, useState } from "react";
import { apiGet, API_URL } from "../api/client.js";
import Filters from "../components/Filters.jsx";
import ProductCard from "../components/ProductCard.jsx";
import BottomCartBar from "../components/BottomCartBar.jsx";

export default function Menu() {
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);

  const [catId, setCatId] = useState(null);
  const [subId, setSubId] = useState(null);

  useEffect(() => {
    apiGet("/api/products")
      .then((p) => setProducts(Array.isArray(p) ? p : []))
      .catch((e) => (console.error(e), setProducts([])));

    apiGet("/api/settings")
      .then((s) => setSettings(s || null))
      .catch((e) => (console.error(e), setSettings(null)));

    apiGet("/api/categories")
      .then((c) => setCategories(Array.isArray(c) ? c : []))
      .catch((e) => (console.error(e), setCategories([])));
  }, []);

  const filtered = useMemo(() => {
    let list = Array.isArray(products) ? products : [];
    if (catId) list = list.filter((p) => Number(p.category_id) === Number(catId));
    if (subId) list = list.filter((p) => Number(p.subcategory_id) === Number(subId));
    return list;
  }, [products, catId, subId]);

  const bg = settings?.menu_background ? `${API_URL}${settings.menu_background}` : "";
  const brand = (settings?.brand_name || "Noor Coffee").trim() || "Noor Coffee";

  return (
    <div className="min-h-screen w-screen relative overflow-hidden pb-28">
      <div
        className="absolute inset-0 bg-cover bg-center scale-[1.03]"
        style={{ backgroundImage: bg ? `url(${bg})` : undefined }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/85" />

      <div className="relative z-10 min-h-screen flex justify-center">
        <div className="w-full max-w-6xl px-4 py-6">
          {/* header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings?.logo_url ? (
                <img
                  src={`${API_URL}${settings.logo_url}`}
                  alt="logo"
                  className="w-10 h-10 rounded-xl object-cover border border-white/20 shadow"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10" />
              )}

              <div className="text-white leading-tight">
                <div className="text-xl md:text-2xl font-extrabold tracking-tight drop-shadow">
                  {brand}
                </div>
                <div className="text-white/70 text-sm">Выбирай — добавляй — оформляй</div>
              </div>
            </div>

            <div className="hidden md:block text-white/60 text-sm">Меню</div>
          </div>

          {/* filters */}
          <div className="mt-6 rounded-[22px] border border-white/20 bg-white/10 backdrop-blur-2xl shadow-xl p-3">
            <Filters
              categories={categories}
              selectedCategoryId={catId}
              selectedSubcategoryId={subId}
              onChangeCategory={setCatId}
              onChangeSubcategory={setSubId}
            />
          </div>

          {/* products */}
          <div className="mt-7">
            {filtered.length === 0 ? (
              <div className="mt-10 text-center text-white/70">Пока нет товаров.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomCartBar />
    </div>
  );
}
