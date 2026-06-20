import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { API_URL } from "../../api/client.js";
import { useAdminData } from "../hooks/useAdminData.js";
import { Input } from "../ui/Input.jsx";
import { Select } from "../ui/Select.jsx";
import { Card } from "../ui/Card.jsx";
import ProductModal from "../components/ProductModal.jsx";

function Badge({ ok, children }) {
  const cls = ok
    ? "bg-emerald-500/15 border-emerald-400/40 text-emerald-200"
    : "bg-red-500/15 border-red-400/40 text-red-200";
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function Thumb({ url, size = "w-12 h-12" }) {
  return url ? (
    <img src={`${API_URL}${url}`} alt="" className={`${size} rounded-xl object-cover shrink-0`} />
  ) : (
    <div className={`${size} rounded-xl bg-white/10 flex items-center justify-center text-white/30 shrink-0`}>
      ☕️
    </div>
  );
}

export default function AdminMenuPage() {
  const { token } = useOutletContext();
  const {
    loading, settings, products, cats,
    upload, createProduct, updateProduct, deleteProduct, setAvailability,
  } = useAdminData(token);

  const [search, setSearch] = useState("");
  const [catId, setCatId] = useState("");
  const [subId, setSubId] = useState("");
  const [status, setStatus] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const currency = settings?.currency || "₽";

  const rootCats = useMemo(() => cats.filter((c) => !c.parent_id), [cats]);
  const subsByCat = useMemo(() => {
    const m = {};
    cats.forEach((c) => c.parent_id && ((m[c.parent_id] ||= []).push(c)));
    return m;
  }, [cats]);

  const filtered = useMemo(() => {
    let list = Array.isArray(products) ? products : [];
    if (catId) list = list.filter((p) => String(p.category_id || "") === String(catId));
    if (subId) list = list.filter((p) => String(p.subcategory_id || "") === String(subId));
    if (status === "available") list = list.filter((p) => p.is_available !== false);
    if (status === "unavailable") list = list.filter((p) => p.is_available === false);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((p) => (p.name || "").toLowerCase().includes(s));
    }
    return list;
  }, [products, catId, subId, status, search]);

  async function onDelete(id) {
    if (!confirm("Удалить товар?")) return;
    try {
      await deleteProduct(id);
    } catch (e) {
      console.error(e);
      alert("Ошибка удаления");
    }
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setModalOpen(true);
  }

  async function submit(payload) {
    try {
      if (editing?.id) await updateProduct(editing.id, payload);
      else await createProduct(payload);
    } catch (e) {
      console.error(e);
      alert("Ошибка сохранения товара");
    }
  }

  const availBtn = (unavailable) =>
    [
      "px-3 py-2 rounded-xl border font-semibold text-sm transition active:scale-95",
      unavailable
        ? "border-white/20 bg-white/10 hover:bg-white/15"
        : "border-amber-400/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-100",
      loading ? "opacity-50 pointer-events-none" : "",
    ].join(" ");

  return (
    <div className="space-y-5">
      <Card
        title="Меню"
        right={
          <button
            onClick={openCreate}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold disabled:opacity-40 hover:from-amber-300 hover:to-amber-400 transition active:scale-95"
          >
            + Добавить
          </button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию…" />

          <Select
            value={catId}
            onChange={(e) => {
              setCatId(e.target.value);
              setSubId("");
            }}
          >
            <option value="">Все категории</option>
            {rootCats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>

          <Select value={subId} onChange={(e) => setSubId(e.target.value)} disabled={!catId}>
            <option value="">Все подкатегории</option>
            {(subsByCat[Number(catId)] || []).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>

          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Все статусы</option>
            <option value="available">В наличии</option>
            <option value="unavailable">Временно недоступно</option>
          </Select>
        </div>

        <div className="mt-3 text-sm text-white/50">
          Найдено: <span className="text-white/80 font-semibold">{filtered.length}</span>
        </div>
      </Card>

      {/* ===== Desktop table ===== */}
      <div className="hidden lg:block rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_110px_140px_180px_220px] gap-3 px-4 py-3 text-white/55 text-sm border-b border-white/10">
          <div>Фото</div>
          <div>Название</div>
          <div>Цена</div>
          <div>Статус</div>
          <div>Наличие</div>
          <div className="text-right">Действия</div>
        </div>

        {filtered.map((p) => {
          const unavailable = p.is_available === false;
          return (
            <div
              key={p.id}
              className="grid grid-cols-[60px_1fr_110px_140px_180px_220px] gap-3 px-4 py-3 items-center border-b border-white/5 hover:bg-white/[0.03] transition"
            >
              <Thumb url={p.image_url} />
              <div className="min-w-0">
                <div className="font-semibold truncate">{p.name}</div>
                <div className="text-xs text-white/50 truncate">{p.description}</div>
              </div>
              <div className="font-semibold">{p.price} {currency}</div>
              <div>{unavailable ? <Badge ok={false}>Недоступно</Badge> : <Badge ok>В наличии</Badge>}</div>
              <div>
                <button disabled={loading} onClick={() => setAvailability(p.id, unavailable)} className={availBtn(unavailable)}>
                  {unavailable ? "Сделать доступным" : "Нет в наличии"}
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => openEdit(p)}
                  className="px-3 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 transition text-sm font-semibold"
                >
                  Изменить
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="px-3 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 transition text-sm font-semibold"
                >
                  Удалить
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-white/50">Ничего не найдено.</div>
        )}
      </div>

      {/* ===== Mobile cards ===== */}
      <div className="lg:hidden space-y-3">
        {filtered.map((p) => {
          const unavailable = p.is_available === false;
          return (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex gap-3">
                <Thumb url={p.image_url} size="w-16 h-16" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold truncate">{p.name}</div>
                    {unavailable ? <Badge ok={false}>Нет</Badge> : <Badge ok>Есть</Badge>}
                  </div>
                  <div className="text-xs text-white/50 line-clamp-2 mt-0.5">{p.description}</div>
                  <div className="mt-1 font-extrabold">{p.price} {currency}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  disabled={loading}
                  onClick={() => setAvailability(p.id, unavailable)}
                  className={[
                    "col-span-3 py-2.5 rounded-xl border font-semibold text-sm transition active:scale-95",
                    unavailable
                      ? "border-amber-400/40 bg-amber-500/15 text-amber-100"
                      : "border-white/15 bg-white/10",
                    loading ? "opacity-50 pointer-events-none" : "",
                  ].join(" ")}
                >
                  {unavailable ? "Сделать доступным" : "Отметить «нет в наличии»"}
                </button>
                <button
                  onClick={() => openEdit(p)}
                  className="col-span-2 py-2.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 transition font-semibold text-sm"
                >
                  Изменить
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  className="py-2.5 rounded-xl bg-red-500/80 hover:bg-red-500 transition font-semibold text-sm"
                >
                  Удалить
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center text-white/50 rounded-2xl border border-white/10 bg-white/[0.04]">
            Ничего не найдено.
          </div>
        )}
      </div>

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        settings={settings}
        cats={cats}
        loading={loading}
        upload={upload}
        onSubmit={submit}
      />
    </div>
  );
}
