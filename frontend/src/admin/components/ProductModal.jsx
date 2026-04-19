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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xl font-extrabold">
            {initial ? "Редактировать товар" : "Добавить товар"}
          </div>
          <button onClick={onClose} className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15">
            ✕
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="text-sm font-semibold text-white/80">Фото</div>
            {form.image_url ? (
              <img src={`${API_URL}${form.image_url}`} className="mt-2 w-full h-44 rounded-xl object-cover" />
            ) : (
              <div className="mt-2 w-full h-44 rounded-xl bg-white/10" />
            )}
            <div className="mt-3">
              <FileButton label="Выбрать фото" disabled={loading} onPick={pickImage} />
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 font-semibold">
            Отмена
          </button>
          <button
            disabled={loading}
            onClick={submit}
            className="px-5 py-3 rounded-2xl bg-white text-black font-bold disabled:opacity-40"
          >
            {initial ? "Сохранить" : "Добавить"}
          </button>
        </div>
      </div>
    </div>
  );
}
