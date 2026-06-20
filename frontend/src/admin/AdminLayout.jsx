import { NavLink, Outlet, Link } from "react-router-dom";
import { useState } from "react";
import AdminGuard from "../components/AdminGuard.jsx";

const NAV = [
  { to: "/admin/menu", label: "Меню", icon: "🍽️" },
  { to: "/admin/categories", label: "Категории", icon: "🏷️" },
  { to: "/admin/appearance", label: "Внешний вид", icon: "🎨" },
];

function Item({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold transition whitespace-nowrap",
          isActive
            ? "bg-amber-500 text-black shadow shadow-amber-500/20"
            : "text-white/80 hover:bg-white/10 hover:text-white",
        ].join(" ")
      }
    >
      <span aria-hidden>{icon}</span>
      {label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const [token, setToken] = useState(() => localStorage.getItem("ADMIN_TOKEN") || "");

  function logout() {
    localStorage.removeItem("ADMIN_TOKEN");
    setToken("");
  }

  return (
    <AdminGuard token={token} onSaveToken={setToken}>
      <div className="min-h-[100dvh] bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-4 md:py-6">
          {/* Top bar (mobile + desktop) */}
          <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center text-lg font-black shrink-0">
                N
              </div>
              <div className="min-w-0">
                <div className="text-lg font-extrabold leading-tight truncate">Админка</div>
                <div className="text-xs text-white/55 truncate">Управление кофейней</div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/"
                className="hidden sm:inline-flex px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-semibold transition"
              >
                ← На сайт
              </Link>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm font-semibold transition"
              >
                Выйти
              </button>
            </div>
          </div>

          {/* Mobile nav: horizontal scroll */}
          <nav className="lg:hidden mb-4 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 rounded-2xl border border-white/10 bg-white/[0.04] p-2">
            {NAV.map((n) => (
              <Item key={n.to} {...n} />
            ))}
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block lg:sticky lg:top-6 h-fit space-y-3">
              <nav className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 space-y-1">
                {NAV.map((n) => (
                  <Item key={n.to} {...n} />
                ))}
              </nav>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/50 leading-relaxed">
                💡 Совет: в разделе «Меню» можно быстро найти блюдо и нажать «Нет в наличии».
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
