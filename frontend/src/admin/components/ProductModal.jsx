import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../api/client.js";
import { Input } from "../ui/Input.jsx";
import { Textarea } from "../ui/Textarea.jsx";
import { Select } from "../ui/Select.jsx";
import { FileButton } from "../ui/FileButton.jsx";

export default function ProductModal({
  open,
  onClose,
  initial, // null для создания или объект товара для редактирования
  settings,
  cats,
  loading,
  upload,       // (file) => {url}
  onSubmit,     // (payload) => Promise
}) {
  const rootCats = useMemo(() => cats.filter((c) => !c.parent_id), [cats]);
  const subsByCat = useMemo(() => {
    const m = {};
    cats.forEach((c) => c.parent_id && ((m[c.parent_id] ||= []).push(c)));
    return m;
  }, [cats]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    subcategory_id: "",
    image_url: ""
  });

  useEffect(() => {
    if (!open) return;
    if (!initial) {
      setForm({ name: "", description: "", price: "", category_id: "", subcategory_id: "", image_url: "" });
    } else {
      setForm({
        name: initial.name || "",
        description: initial.description || "",
        price: String(initial.price ?? ""),
        category_id: initial.category_id ? String(initial.category_id) : "",
        subcategory_id: initial.subcategory_id ? String(initial.subcategory_id) : "",
        image_url: initial.image_url || ""
      });
    }
  }, [open, initial]);

  const currentSubs = useMemo(() => subsByCat[Number(form.category_id)] || [], [subsByCat, form.category_id]);

  async function pickImage(file) {
    try {
      const up = await upload(file);
      if (up?.url) setForm((f) => ({ ...f, image_url: up.url }));
    } catch (e) {
      console.error(e);
      alert("Ошибка загрузки");
    }
  }

  async function submit() {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category_id: form.category_id ? Number(form.category_id) : null,
      subcategory_id: form.subcategory_id ? Number(form.subcategory_id) : null,
      image_url: form.image_url || "",
    };

    if (!payload.name || !payload.price || payload.price <= 0) return alert("Заполни название и цену");
    if (!payload.category_id) return alert("Выбери категорию");

    await onSubmit(payload);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
      <div className="w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl border border-white/10 bg-zinc-950 max-h-[92dvh] flex flex-col animate-fade-up">
        <div className="flex items-center justify-between gap-3 p-5 pb-3 border-b border-white/10">
          <div className="text-xl font-extrabold">
            {initial ? "Редактировать товар" : "Добавить товар"}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 transition" aria-label="Закрыть">
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input value={form.name} placeholder="Название" onChange={(e)=>setForm(f=>({...f, name:e.target.value}))} />
          <Input
            value={form.price}
            placeholder={`Цена (${settings?.currency || "₽"})`}
            type="number"
            onChange={(e)=>setForm(f=>({...f, price:e.target.value}))}
          />

          <div className="md:col-span-2">
            <Textarea value={form.description} placeholder="Описание" onChange={(e)=>setForm(f=>({...f, description:e.target.value}))}/>
          </div>

          <Select
            value={form.category_id}
            onChange={(e)=>setForm(f=>({...f, category_id:e.target.value, subcategory_id:""}))}
          >
            <option value="">Категория…</option>
            {rootCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          <Select
            value={form.subcategory_id}
            onChange={(e)=>setForm(f=>({...f, subcategory_id:e.target.value}))}
            disabled={!form.category_id}
          >
            <option value="">Подкатегория (необязательно)…</option>
            {currentSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>

          <div className="md:col-span-2 rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-white/80">Фото или GIF</div>
              <div className="text-xs text-white/40">JPG, PNG, WEBP, GIF</div>
            </div>
            {form.image_url ? (
              <div className="relative mt-2">
                <img src={`${API_URL}${form.image_url}`} className="w-full h-44 rounded-xl object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                  className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 hover:bg-black/80 border border-white/20 text-white transition"
                  aria-label="Убрать фото"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="mt-2 w-full h-44 rounded-xl bg-white/10 grid place-items-center text-white/35 text-sm">
                Нет изображения
              </div>
            )}
            <div className="mt-3">
              <FileButton label={loading ? "Загрузка…" : "Выбрать фото или GIF"} disabled={loading} onPick={pickImage} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end p-5 pt-3 border-t border-white/10 pb-safe">
          <button onClick={onClose} className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 font-semibold transition">
            Отмена
          </button>
          <button
            disabled={loading}
            onClick={submit}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold disabled:opacity-40 hover:from-amber-300 hover:to-amber-400 transition active:scale-95"
          >
            {initial ? "Сохранить" : "Добавить"}
          </button>
        </div>
      </div>
    </div>
  );
}
