// frontend/src/admin/pages/MenuPage.jsx
import { useMemo, useState } from "react";
import { API_URL } from "../../api/client.js";
import { Input } from "../ui/Input.jsx";
import { Select } from "../ui/Select.jsx";
import { Button } from "../ui/Button.jsx";
import { Badge } from "../ui/Badge.jsx";

export default function MenuPage({
  settings,
  products,
  cats,
  loading,
  setAvailability,  // (id, is_available)
  onAddProduct,     // открыть модалку добавления
  onEditProduct,    // открыть модалку редактирования
  onDeleteProduct,  // удалить
}) {
  const [search, setSearch] = useState("");
  const [catId, setCatId] = useState("");
  const [subId, setSubId] = useState("");
  const [status, setStatus] = useState(""); // "" | "available" | "unavailable"

  const rootCats = useMemo(() => cats.filter(c => !c.parent_id), [cats]);
  const subsByCat = useMemo(() => {
    const m = {};
    cats.forEach(c => {
      if (c.parent_id) (m[c.parent_id] ||= []).push(c);
    });
    return m;
  }, [cats]);

  const filtered = useMemo(() => {
    let list = Array.isArray(products) ? products : [];

    if (catId) list = list.filter(p => String(p.category_id||"") === String(catId));
    if (subId) list = list.filter(p => String(p.subcategory_id||"") === String(subId));

    if (status === "available") list = list.filter(p => p.is_available !== false);
    if (status === "unavailable") list = list.filter(p => p.is_available === false);

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(p => (p.name||"").toLowerCase().includes(s));
    }
    return list;
  }, [products, catId, subId, status, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск по названию…" />

          <Select value={catId} onChange={e=>{setCatId(e.target.value); setSubId("");}}>
            <option value="">Все категории</option>
            {rootCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          <Select value={subId} onChange={e=>setSubId(e.target.value)} disabled={!catId}>
            <option value="">Все подкатегории</option>
            {(subsByCat[Number(catId)]||[]).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>

          <Select value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="">Все статусы</option>
            <option value="available">В наличии</option>
            <option value="unavailable">Временно недоступно</option>
          </Select>
        </div>

        <Button onClick={onAddProduct} disabled={loading}>
          + Добавить товар
        </Button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_120px_120px_160px_220px] gap-3 px-4 py-3 text-white/60 text-sm border-b border-white/10">
          <div>Фото</div>
          <div>Название</div>
          <div>Цена</div>
          <div>Статус</div>
          <div>Наличие</div>
          <div className="text-right">Действия</div>
        </div>

        {filtered.map(p => {
          const unavailable = p.is_available === false;
          return (
            <div key={p.id} className="grid grid-cols-[60px_1fr_120px_120px_160px_220px] gap-3 px-4 py-3 items-center border-b border-white/10">
              <div>
                {p.image_url
                  ? <img src={`${API_URL}${p.image_url}`} className="w-12 h-12 rounded-xl object-cover" />
                  : <div className="w-12 h-12 rounded-xl bg-white/10" />
                }
              </div>

              <div className="min-w-0">
                <div className="font-semibold truncate">{p.name}</div>
                <div className="text-xs text-white/60 truncate">{p.description}</div>
              </div>

              <div className="font-semibold">
                {p.price} {settings?.currency || "₽"}
              </div>

              <div>
                {unavailable ? <Badge variant="danger">Недоступно</Badge> : <Badge variant="ok">В наличии</Badge>}
              </div>

              <div>
                <button
                  disabled={loading}
                  onClick={() => setAvailability(p.id, unavailable ? true : false)}
                  className={[
                    "px-3 py-2 rounded-xl border font-semibold transition",
                    unavailable
                      ? "border-white/20 bg-white/10 hover:bg-white/15"
                      : "border-emerald-400/40 bg-emerald-500/15 hover:bg-emerald-500/20"
                  ].join(" ")}
                >
                  {unavailable ? "Сделать доступным" : "Нет в наличии"}
                </button>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => onEditProduct(p)}
                  className="px-3 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 transition"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => onDeleteProduct(p.id)}
                  className="px-3 py-2 rounded-xl bg-red-500/90 hover:bg-red-500 transition"
                >
                  Удалить
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-white/60">
            Ничего не найдено.
          </div>
        )}
      </div>
    </div>
  );
}
