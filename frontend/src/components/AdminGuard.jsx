import { useState } from "react";
import { Link } from "react-router-dom";

export default function AdminGuard({ token, onSaveToken, children }) {
  const [local, setLocal] = useState(token);
  const [show, setShow] = useState(false);

  function save() {
    if (!local.trim()) return;
    localStorage.setItem("ADMIN_TOKEN", local.trim());
    onSaveToken(local.trim());
  }

  if (!token) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 text-white flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl bg-white/[0.04] border border-white/10 p-6 md:p-7 shadow-2xl animate-fade-up">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black flex items-center justify-center text-2xl font-black mb-4">
            N
          </div>
          <h1 className="text-2xl font-extrabold">Вход в админку</h1>
          <p className="text-white/60 mt-1 text-sm">
            Введите админ-ключ (ADMIN_TOKEN из backend/.env)
          </p>

          <div className="relative mt-5">
            <input
              className="w-full px-4 py-3 pr-20 rounded-xl bg-black/40 border border-white/10 outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20"
              placeholder="ADMIN TOKEN"
              type={show ? "text" : "password"}
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 transition"
            >
              {show ? "Скрыть" : "Показать"}
            </button>
          </div>

          <button
            className="mt-4 w-full px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold transition hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] disabled:opacity-40"
            onClick={save}
            disabled={!local.trim()}
          >
            Войти
          </button>

          <Link
            to="/"
            className="mt-4 block text-center text-sm text-white/50 hover:text-white/80 transition"
          >
            ← Вернуться на сайт
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
