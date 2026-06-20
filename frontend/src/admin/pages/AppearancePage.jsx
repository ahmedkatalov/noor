import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { API_URL } from "../../api/client.js";
import { useAdminData } from "../hooks/useAdminData.js";
import { Card } from "../ui/Card.jsx";
import { Input } from "../ui/Input.jsx";
import { FileButton } from "../ui/FileButton.jsx";

function draftFrom(settings) {
  return {
    brand_name: settings?.brand_name || "",
    whatsapp_phone: settings?.whatsapp_phone || "",
    currency: settings?.currency || "₽",
    home_background: settings?.home_background || "",
    menu_background: settings?.menu_background || "",
    logo_url: settings?.logo_url || "",
  };
}

export default function AppearancePage() {
  const { token } = useOutletContext();
  const { loading, settings, upload, saveSettings } = useAdminData(token);

  const [draft, setDraft] = useState(() => draftFrom(settings));

  // Когда настройки подгрузились/обновились — пересобираем черновик из них
  // (паттерн "reset state on prop change" без useEffect).
  const [seen, setSeen] = useState(settings);
  if (settings !== seen) {
    setSeen(settings);
    setDraft(draftFrom(settings));
  }

  async function pick(field, file) {
    try {
      const up = await upload(file);
      if (up?.url) setDraft((d) => ({ ...d, [field]: up.url }));
    } catch (e) {
      console.error(e);
      alert("Ошибка загрузки файла");
    }
  }

  async function save() {
    try {
      await saveSettings(draft);
      alert("Сохранено ✅");
    } catch (e) {
      console.error(e);
      alert("Ошибка сохранения");
    }
  }

  const brandPreview = (draft.brand_name || "").trim() || "Название кофейни";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
        <div className="space-y-5">
          <Card title="Основные настройки">
            <div className="space-y-3">
              <Input value={draft.brand_name} placeholder="Название кофейни" onChange={(e)=>setDraft(d=>({...d, brand_name:e.target.value}))} />
              <Input
                value={draft.whatsapp_phone}
                placeholder="WhatsApp номер (пример: 7928...)"
                onChange={(e)=>setDraft(d=>({...d, whatsapp_phone: e.target.value.replace(/[^\d]/g, "")}))}
              />
              <Input value={draft.currency} placeholder="Валюта (например ₽)" onChange={(e)=>setDraft(d=>({...d, currency:e.target.value}))} />

              <div className="text-xs text-white/50">
                Превью: <span className="text-white/80 font-semibold">{brandPreview}</span>
              </div>

              <button
                onClick={save}
                disabled={loading}
                className="w-full px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold disabled:opacity-40 hover:from-amber-300 hover:to-amber-400 transition active:scale-[0.98]"
              >
                {loading ? "Сохранение…" : "Сохранить настройки"}
              </button>
            </div>
          </Card>

          <Card title="Логотип">
            <div className="space-y-3">
              {draft.logo_url ? (
                <img src={`${API_URL}${draft.logo_url}`} className="w-full h-44 rounded-xl object-cover border border-white/10" />
              ) : (
                <div className="w-full h-44 rounded-xl bg-white/10" />
              )}
              <FileButton label="Загрузить логотип" disabled={loading} onPick={(f)=>pick("logo_url", f)} />
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Фон главной страницы">
            <div className="space-y-3">
              {draft.home_background ? (
                <img src={`${API_URL}${draft.home_background}`} className="w-full h-56 rounded-xl object-cover border border-white/10" />
              ) : (
                <div className="w-full h-56 rounded-xl bg-white/10" />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FileButton label="Выбрать фото/гиф" disabled={loading} onPick={(f)=>pick("home_background", f)} />
                <button
                  disabled={loading}
                  onClick={() => setDraft((d) => ({ ...d, home_background: "" }))}
                  className="px-4 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 transition font-semibold disabled:opacity-40"
                >
                  Убрать фон
                </button>
              </div>
            </div>
          </Card>

          <Card title="Фон меню">
            <div className="space-y-3">
              {draft.menu_background ? (
                <img src={`${API_URL}${draft.menu_background}`} className="w-full h-56 rounded-xl object-cover border border-white/10" />
              ) : (
                <div className="w-full h-56 rounded-xl bg-white/10" />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FileButton label="Выбрать фото/гиф" disabled={loading} onPick={(f)=>pick("menu_background", f)} />
                <button
                  disabled={loading}
                  onClick={() => setDraft((d) => ({ ...d, menu_background: "" }))}
                  className="px-4 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 transition font-semibold disabled:opacity-40"
                >
                  Убрать фон
                </button>
              </div>
            </div>
          </Card>

          <div className="text-xs text-white/45">
            Изменения применятся после кнопки <b>“Сохранить настройки”</b>.
          </div>
        </div>
      </div>
    </div>
  );
}
