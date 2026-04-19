import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import AdminGuard from "../components/AdminGuard.jsx";

function Item({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition",
          isActive ? "bg-white text-black" : "text-white/80 hover:bg-white/10 hover:text-white"
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function AdminLayout() {
  const [token, setToken] = useState(() => localStorage.getItem("ADMIN_TOKEN") || "");

  return (
    <AdminGuard token={token} onSaveToken={setToken}>
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
            {/* Sidebar */}
            <aside className="lg:sticky lg:top-6 h-fit">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-lg font-extrabold">Админка</div>
                <div className="text-xs text-white/60 mt-1">
                  Быстрые действия для персонала
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-2 space-y-1">
                <Item to="/admin/menu">Меню</Item>
                <Item to="/admin/categories">Категории</Item>
                <Item to="/admin/appearance">Внешний вид</Item>
              </div>

              <div className="mt-3 text-xs text-white/45 px-1">
                Совет: в “Меню” можно быстро найти блюдо и нажать “Нет в наличии”.
              </div>
            </aside>

            {/* Content */}
            <main className="min-w-0">
              <Outlet context={{ token }} />
            </main>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
