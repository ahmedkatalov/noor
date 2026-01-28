import { useEffect, useMemo, useState } from "react";
import { apiGet, API_URL } from "../api/client.js";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [settings, setSettings] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    apiGet("/api/settings").then((s) => setSettings(s || null)).catch(console.error);
  }, []);

  const bg = useMemo(() => {
    return settings?.home_background ? `${API_URL}${settings.home_background}` : "";
  }, [settings?.home_background]);

  const brand = (settings?.brand_name || "").trim() || "Noor Coffee";
  const logo = settings?.logo_url ? `${API_URL}${settings.logo_url}` : "";

  return (
    <div className="min-h-screen w-screen relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-[1.02]"
        style={{ backgroundImage: bg ? `url(${bg})` : undefined }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="relative w-full max-w-md rounded-[28px] border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl p-6 md:p-8 text-center">

          {/* Logo (optional, но красиво) */}
          {logo ? (
            <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden border border-white/20 shadow mb-4">
              <img src={logo} alt="logo" className="w-full h-full object-cover" />
            </div>
          ) : null}

          <div className="text-white">
            <div className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow">
              {brand}
            </div>

            <div className="mt-3 text-white/85 text-base md:text-lg leading-snug">
              Кофе, напитки, десерты и еда — выбирай и оформляй заказ в WhatsApp.
            </div>
          </div>

          <button
            className="mt-8 w-full rounded-2xl bg-white/20 hover:bg-white/25 active:scale-[0.99]
                       text-white font-semibold py-4 transition
                       border border-white/25 backdrop-blur-xl shadow-lg"
            onClick={() => nav("/menu")}
          >
            Перейти к меню
          </button>
        </div>
      </div>
    </div>
  );
}
