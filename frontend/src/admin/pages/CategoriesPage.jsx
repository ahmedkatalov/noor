import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAdminData } from "../hooks/useAdminData.js";
import { Card } from "../ui/Card.jsx";
import { Input } from "../ui/Input.jsx";
import { Select } from "../ui/Select.jsx";

export default function CategoriesPage() {
  const { token } = useOutletContext();
  const { loading, cats, createCategory, deleteCategory } = useAdminData(token);

  const [newCatName, setNewCatName] = useState("");
  const [selectedCatForSub, setSelectedCatForSub] = useState("");
  const [newSubName, setNewSubName] = useState("");

  const rootCats = useMemo(() => cats.filter((c) => !c.parent_id), [cats]);
  const subsByCat = useMemo(() => {
    const m = {};
    cats.forEach((c) => c.parent_id && ((m[c.parent_id] ||= []).push(c)));
    return m;
  }, [cats]);

  async function addRoot() {
    const nm = newCatName.trim();
    if (!nm) return;
    try {
      await createCategory(nm, null);
      setNewCatName("");
    } catch (e) {
      console.error(e);
      alert("Ошибка добавления категории");
    }
  }

  async function addSub() {
    const nm = newSubName.trim();
    if (!nm || !selectedCatForSub) return;
    try {
      await createCategory(nm, Number(selectedCatForSub));
      setNewSubName("");
    } catch (e) {
      console.error(e);
      alert("Ошибка добавления подкатегории");
    }
  }

  async function del(id) {
    if (!confirm("Удалить? Подкатегории тоже удалятся.")) return;
    try {
      await deleteCategory(id);
    } catch (e) {
      console.error(e);
      alert("Ошибка удаления");
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Категории">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input value={newCatName} placeholder="Новая категория (например: Кофе)" onChange={(e)=>setNewCatName(e.target.value)} />
          <button
            disabled={loading || !newCatName.trim()}
            onClick={addRoot}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold disabled:opacity-40 hover:from-amber-300 hover:to-amber-400 transition active:scale-95"
          >
            Добавить
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {rootCats.length === 0 ? (
            <div className="text-white/60 text-sm">Категорий пока нет.</div>
          ) : (
            rootCats.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                <div className="font-semibold">{c.name}</div>
                <button
                  disabled={loading}
                  onClick={() => del(c.id)}
                  className="text-sm px-3 py-2 rounded-xl bg-red-500/90 hover:bg-red-500 disabled:opacity-40"
                >
                  Удалить
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card title="Подкатегории">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select value={selectedCatForSub} onChange={(e)=>setSelectedCatForSub(e.target.value)}>
            <option value="">Выбери категорию…</option>
            {rootCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>

          <Input value={newSubName} placeholder="Подкатегория (например: Американо)" onChange={(e)=>setNewSubName(e.target.value)} />

          <button
            disabled={loading || !selectedCatForSub || !newSubName.trim()}
            onClick={addSub}
            className="sm:col-span-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold disabled:opacity-40 hover:from-amber-300 hover:to-amber-400 transition active:scale-95"
          >
            Добавить подкатегорию
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {!selectedCatForSub ? (
            <div className="text-white/60 text-sm">Сначала выбери категорию.</div>
          ) : (subsByCat[Number(selectedCatForSub)] || []).length === 0 ? (
            <div className="text-white/60 text-sm">Подкатегорий пока нет.</div>
          ) : (
            (subsByCat[Number(selectedCatForSub)] || []).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                <div className="font-semibold">{s.name}</div>
                <button
                  disabled={loading}
                  onClick={() => del(s.id)}
                  className="text-sm px-3 py-2 rounded-xl bg-red-500/90 hover:bg-red-500 disabled:opacity-40"
                >
                  Удалить
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
