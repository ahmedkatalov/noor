import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { API_URL } from "../../api/client.js";
import { useAdminData } from "../hooks/useAdminData.js";
import { Card } from "../ui/Card.jsx";
import { Input } from "../ui/Input.jsx";
import { FileButton } from "../ui/FileButton.jsx";
import {
  ACCENT_PRESETS,
  BG_PRESETS,
  applyAccent,
  resolveBackground,
} from "../../theme.js";

function draftFrom(settings) {
  return {
    brand_name: settings?.brand_name || "",
    whatsapp_phone: settings?.whatsapp_phone || "",
    currency: settings?.currency || "₽",
    home_background: settings?.home_background || "",
    menu_background: settings?.menu_background || "",
    logo_url: settings?.logo_url || "",
    accent_color: settings?.accent_color || "#f59e0b",
  };
}

// Выбор фона: пресеты + загрузка своего фото/гиф.
function BgPicker({ label, value, loading, onUpload, onSet }) {
  const { style } = resolveBackground(value);
  const isImage = (value || "").startsWith("/uploads");
  const activePreset = BG_PRESETS.find((p) => p.key === (value || ""));

  return (
    <Card title={label}>
      {/* Превью */}
      <div
        className="rounded-xl h-40 border border-white/10 bg-cover bg-center"
        style={style}
      />

      {/* Пресеты */}
      <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
        {BG_PRESETS.map((p) => {
          const active = !isImage && (value || "") === p.key;
          return (
            <button
              key={p.key || "default"}
              onClick={() => onSet(p.key)}
              title={p.label}
              className={`h-12 rounded-lg border-2 bg-cover bg-center transition ${
                active ? "border-white scale-105" : "border-white/15 hover:border-white/40"
              }`}
              style={{ backgroundImage: p.css }}
            />
          );
        })}
      </div>

      {/* Загрузка + статус */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
        <FileButton
          label={loading ? "Загрузка…" : "Загрузить фото / GIF"}
          disabled={loading}
          onPick={onUpload}
        />
        <div className="text-xs text-white/45">
          Сейчас:{" "}
          <span className="text-white/70 font-semibold">
            {isImage ? "своё фото" : `пресет «${activePreset?.label || "Блики света"}»`}
          </span>
        </div>
      </div>
    </Card>
  );
}

export default function AppearancePage() {
  const { token } = useOutletContext();
  const { loading, settings, upload, saveSettings } = useAdminData(token);

  const [draft, setDraft] = useState(() => draftFrom(settings));

  // Пересборка черновика при обновлении настроек (reset state on prop change).
  const [seen, setSeen] = useState(settings);
  if (settings !== seen) {
    setSeen(settings);
    setDraft(draftFrom(settings));
  }

  function setAccent(hex) {
    setDraft((d) => ({ ...d, accent_color: hex }));
    applyAccent(hex); // живое превью — кнопки перекрашиваются сразу
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
        {/* Левая колонка */}
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

          <Card title="Цвет кнопок (акцент)">
            <div className="space-y-4">
              {/* Готовые цвета */}
              <div className="flex flex-wrap gap-2">
                {ACCENT_PRESETS.map((p) => {
                  const active = (draft.accent_color || "").toLowerCase() === p.hex;
                  return (
                    <button
                      key={p.hex}
                      onClick={() => setAccent(p.hex)}
                      title={p.name}
                      className={`w-10 h-10 rounded-xl border-2 transition ${
                        active ? "border-white scale-110" : "border-white/20 hover:border-white/50"
                      }`}
                      style={{ background: p.hex }}
                    />
                  );
                })}
              </div>

              {/* Свой цвет */}
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(draft.accent_color) ? draft.accent_color : "#f59e0b"}
                  onChange={(e) => setAccent(e.target.value)}
                  className="w-12 h-12 rounded-lg bg-transparent cursor-pointer border border-white/15"
                  aria-label="Свой цвет"
                />
                <Input
                  value={draft.accent_color}
                  placeholder="#f59e0b"
                  onChange={(e) => setAccent(e.target.value)}
                />
              </div>

              {/* Демонстрация */}
              <div className="flex items-center gap-2 pt-1">
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-bold">
                  Кнопка
                </button>
                <span className="px-3 py-2 rounded-xl border border-amber-400/40 text-amber-300 text-sm font-semibold">
                  акцент
                </span>
              </div>

              <div className="text-xs text-white/45">
                Цвет применяется сразу (превью) и ко всему сайту после «Сохранить».
                На кнопках чёрный текст — лучше выбирать яркие цвета.
              </div>
            </div>
          </Card>

          <Card title="Логотип">
            <div className="space-y-3">
              {draft.logo_url ? (
                <img src={`${API_URL}${draft.logo_url}`} className="w-full h-44 rounded-xl object-cover border border-white/10" />
              ) : (
                <div className="w-full h-44 rounded-xl bg-white/10 grid place-items-center text-white/35 text-sm">
                  Нет логотипа
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <FileButton label="Загрузить логотип" disabled={loading} onPick={(f)=>pick("logo_url", f)} />
                {draft.logo_url && (
                  <button
                    disabled={loading}
                    onClick={() => setDraft((d) => ({ ...d, logo_url: "" }))}
                    className="px-4 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 transition font-semibold disabled:opacity-40"
                  >
                    Убрать логотип
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Правая колонка — фоны */}
        <div className="space-y-5">
          <BgPicker
            label="Фон главной страницы"
            value={draft.home_background}
            loading={loading}
            onUpload={(f) => pick("home_background", f)}
            onSet={(k) => setDraft((d) => ({ ...d, home_background: k }))}
          />

          <BgPicker
            label="Фон меню"
            value={draft.menu_background}
            loading={loading}
            onUpload={(f) => pick("menu_background", f)}
            onSet={(k) => setDraft((d) => ({ ...d, menu_background: k }))}
          />

          <div className="text-xs text-white/45">
            Можно выбрать готовый фон-пресет (без фото) или загрузить своё фото/GIF.
            Не забудь нажать <b>«Сохранить настройки»</b> слева.
          </div>
        </div>
      </div>
    </div>
  );
}
