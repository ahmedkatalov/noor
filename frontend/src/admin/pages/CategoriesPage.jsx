import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAdminData } from "../hooks/useAdminData.js";
import { Card } from "../ui/Card.jsx";
import { Input } from "../ui/Input.jsx";

export default function CategoriesPage() {
  const { token } = useOutletContext();
  const { loading, cats, createCategory, deleteCategory } = useAdminData(token);

  const [newCatName, setNewCatName] = useState("");
  const [openId, setOpenId] = useState(null); // раскрытая категория (по умолчанию всё свёрнуто)
  const [newSubName, setNewSubName] = useState("");

  const rootCats = useMemo(() => cats.filter((c) => !c.parent_id), [cats]);
  const subsByCat = useMemo(() => {
    const m = {};
    cats.forEach((c) => c.parent_id && ((m[c.parent_id] ||= []).push(c)));
    return m;
  }, [cats]);

  function toggle(id) {
    setOpenId((cur) => (cur === id ? null : id));
    setNewSubName("");
  }

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

  async function addSub(catId) {
    const nm = newSubName.trim();
    if (!nm) return;
    try {
      await createCategory(nm, Number(catId));
      setNewSubName("");
    } catch (e) {
      console.error(e);
      alert("Ошибка добавления подкатегории");
    }
  }

  async function del(id, withSubs) {
    const msg = withSubs
      ? "Удалить категорию? Все её подкатегории тоже удалятся."
      : "Удалить подкатегорию?";
    if (!confirm(msg)) return;
    try {
      await deleteCategory(id);
    } catch (e) {
      console.error(e);
      alert("Ошибка удаления");
    }
  }

  return (
    <div className="space-y-5">
      <Card title="Категории и подкатегории">
        {/* Добавить категорию */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={newCatName}
            placeholder="Новая категория (например: Кофе)"
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addRoot()}
          />
          <button
            disabled={loading || !newCatName.trim()}
            onClick={addRoot}
            className="shrink-0 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold disabled:opacity-40 hover:from-amber-300 hover:to-amber-400 transition active:scale-95"
          >
            + Добавить
          </button>
        </div>

        <div className="mt-2 text-xs text-white/45">
          Нажми на категорию, чтобы раскрыть её подкатегории.
        </div>

        {/* Аккордеон категорий */}
        <div className="mt-4 space-y-2">
          {rootCats.length === 0 ? (
            <div className="text-white/55 text-sm py-6 text-center">
              Категорий пока нет — добавь первую сверху.
            </div>
          ) : (
            rootCats.map((c) => {
              const subs = subsByCat[c.id] || [];
              const isOpen = openId === c.id;
              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden"
                >
                  {/* Заголовок категории */}
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <button
                      onClick={() => toggle(c.id)}
                      className="flex-1 flex items-center gap-3 min-w-0 text-left"
                    >
                      <span
                        className={`grid place-items-center w-7 h-7 rounded-lg bg-white/5 text-white/70 transition-transform duration-200 ${
                          isOpen ? "rotate-90" : ""
                        }`}
                      >
                        ›
                      </span>
                      <span className="font-semibold truncate">{c.name}</span>
                      <span className="text-xs text-white/40 shrink-0">
                        {subs.length} подкат.
                      </span>
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => del(c.id, subs.length > 0)}
                      className="shrink-0 text-sm px-3 py-1.5 rounded-lg border border-red-400/30 text-red-300 hover:bg-red-500/15 disabled:opacity-40 transition"
                    >
                      Удалить
                    </button>
                  </div>

                  {/* Тело: подкатегории + добавление */}
                  {isOpen && (
                    <div className="px-3 pb-3 pt-1 border-t border-white/10 space-y-2 animate-fade-in">
                      {subs.length === 0 ? (
                        <div className="text-white/45 text-sm py-1 ml-9">
                          Подкатегорий нет.
                        </div>
                      ) : (
                        subs.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 sm:ml-9"
                          >
                            <div className="text-sm truncate">{s.name}</div>
                            <button
                              disabled={loading}
                              onClick={() => del(s.id, false)}
                              className="shrink-0 text-xs px-2.5 py-1 rounded-md text-red-300 hover:bg-red-500/15 disabled:opacity-40 transition"
                            >
                              Удалить
                            </button>
                          </div>
                        ))
                      )}

                      {/* Добавить подкатегорию */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:ml-9 pt-1">
                        <Input
                          value={newSubName}
                          placeholder="Новая подкатегория…"
                          onChange={(e) => setNewSubName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addSub(c.id)}
                        />
                        <button
                          disabled={loading || !newSubName.trim()}
                          onClick={() => addSub(c.id)}
                          className="shrink-0 px-4 py-3 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 font-semibold disabled:opacity-40 transition"
                        >
                          + Подкатегория
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
