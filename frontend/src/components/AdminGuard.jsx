import { useState } from "react";

export default function AdminGuard({ token, onSaveToken, children }) {
  const [local, setLocal] = useState(token);

  function save() {
    localStorage.setItem("ADMIN_TOKEN", local);
    onSaveToken(local);
  }

  if (!token) {
    return (
      <div className="min-h-full bg-zinc-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white/5 border border-white/10 p-5">
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="text-white/70 mt-2">Введи админ-ключ (ADMIN_TOKEN из backend/.env)</p>

          <input
            className="mt-4 w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none"
            placeholder="ADMIN TOKEN"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
          />

          <button
            className="mt-4 w-full px-6 py-3 rounded-2xl bg-white text-black font-semibold transition hover:scale-[1.01]"
            onClick={save}
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return children;
}
