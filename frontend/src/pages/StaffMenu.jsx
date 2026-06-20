import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminGuard from "../components/AdminGuard.jsx";
import { useAdminData } from "../admin/hooks/useAdminData.js";
import { API_URL } from "../api/client.js";

export default function StaffMenu() {
  const [token, setToken] = useState(() => localStorage.getItem("ADMIN_TOKEN") || "");
  const { loading, settings, products, setAvailability } = useAdminData(token);

  function logout() {
    localStorage.removeItem("ADMIN_TOKEN");
    setToken("");
  }

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(""); // "" | "available" | "unavailable"

  const filtered = useMemo(() => {
    let list = Array.isArray(products) ? products : [];

    if (status === "available") list = list.filter((p) => p.is_available !== false);
    if (status === "unavailable") list = list.filter((p) => p.is_available === false);

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((p) => (p.name || "").toLowerCase().includes(s));
    }

    // удобно: сортировать так, чтобы недоступные были сверху/снизу
    list = list.slice().sort((a, b) => Number(a.is_available === false) - Number(b.is_available === false));
    return list;
  }, [products, search, status]);

  return (
    <AdminGuard token={token} onSaveToken={setToken}>
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-extrabold">Панель персонала</div>
                <div className="text-sm text-white/60 mt-1">
                  Быстро отмечайте блюда как «нет в наличии»
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/admin"
                  className="px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-semibold transition"
                >
                  Админка
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-semibold transition"
                >
                  Выйти
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск блюда…"
                className="h-12 px-4 rounded-xl bg-black/40 border border-white/10 outline-none text-white w-full transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 placeholder:text-white/40"
              />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-12 px-4 rounded-xl bg-black/40 border border-white/10 outline-none text-white w-full transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
              >
                <option value="">Все</option>
                <option value="available">В наличии</option>
                <option value="unavailable">Недоступно</option>
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {filtered.map((p) => {
              const unavailable = p.is_available === false;
              return (
                <div
                  key={p.id}
                  className={[
                    "rounded-2xl border border-white/10 bg-white/5 p-4",
                    unavailable ? "opacity-80" : ""
                  ].join(" ")}
                >
                  <div className="flex items-center gap-3">
                    {p.image_url ? (
                      <img
                        src={`${API_URL}${p.image_url}`}
                        className="w-14 h-14 rounded-xl object-cover"
                        alt=""
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-white/10" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{p.name}</div>
                      <div className="text-xs text-white/60 truncate">{p.description}</div>
                      <div className="mt-1 text-sm font-semibold">
                        {p.price} {settings?.currency || "₽"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span
                      className={[
                        "inline-flex px-3 py-1 rounded-full border text-xs font-semibold",
                        unavailable
                          ? "bg-red-500/15 border-red-400/40 text-red-200"
                          : "bg-emerald-500/15 border-emerald-400/40 text-emerald-200"
                      ].join(" ")}
                    >
                      {unavailable ? "Временно недоступно" : "В наличии"}
                    </span>

                    <button
                      disabled={loading}
                      onClick={() => setAvailability(p.id, unavailable)}
                      className={[
                        "px-4 py-2 rounded-xl font-bold transition active:scale-95",
                        unavailable
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400"
                          : "bg-white/10 border border-white/20 hover:bg-white/15",
                        loading ? "opacity-40 pointer-events-none" : "",
                      ].join(" ")}
                    >
                      {unavailable ? "Сделать доступным" : "Нет в наличии"}
                    </button>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center text-white/60 py-10">Ничего не найдено.</div>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
