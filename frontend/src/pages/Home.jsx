import { useEffect, useState } from "react";
import { apiGet, API_URL } from "../api/client.js";
import { useNavigate } from "react-router-dom";
import { resolveBackground } from "../theme.js";

export default function Home() {
  const [settings, setSettings] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    apiGet("/api/settings").then((s) => setSettings(s || null)).catch(console.error);
  }, []);

  const { style: bgStyle, isImage } = resolveBackground(settings?.home_background);

  const brand = (settings?.brand_name || "").trim() || "Noor Coffee";
  const logo = settings?.logo_url ? `${API_URL}${settings.logo_url}` : "";

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden">
      {/* Background (фото / гиф / пресет) */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-[1.05] animate-fade-in"
        style={bgStyle}
      />
      {/* Decorative gradients */}
      <div
        className={`absolute inset-0 ${
          isImage
            ? "bg-gradient-to-b from-black/55 via-black/35 to-black/80"
            : "bg-black/10"
        }`}
      />
      <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-amber-500/20 blur-[120px]" />
      <div className="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-amber-700/15 blur-[140px]" />

      {/* Content */}
      <div className="relative z-10 min-h-[100dvh] flex items-center justify-center px-4 py-10 pt-safe pb-safe">
        <div className="relative w-full max-w-md rounded-[28px] border border-white/15 bg-white/10 backdrop-blur-2xl shadow-2xl p-7 md:p-9 text-center animate-fade-up">
          {/* Logo */}
          <div className="mx-auto w-20 h-20 rounded-2xl overflow-hidden border border-white/20 shadow-lg mb-5 bg-white/10">
            {logo ? (
              <img src={logo} alt={brand} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">☕️</div>
            )}
          </div>

          <div className="text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow">
              {brand}
            </h1>

            <p className="mt-3 text-white/80 text-base md:text-lg leading-snug">
              Кофе, напитки, десерты и еда — выбирай и оформляй заказ в WhatsApp.
            </p>
          </div>

          <button
            className="group mt-8 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500
                       hover:from-amber-300 hover:to-amber-400 active:scale-[0.98]
                       text-black font-bold py-4 text-lg transition
                       shadow-lg shadow-amber-500/25"
            onClick={() => nav("/menu")}
          >
            Перейти к меню
            <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
          </button>

          <div className="mt-4 text-white/45 text-xs">
            Свежий кофе • Быстрый заказ • Без регистрации
          </div>
        </div>
      </div>
    </div>
  );
}
