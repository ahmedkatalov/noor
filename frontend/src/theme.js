// Управление акцентным цветом и фонами-пресетами.
// Цвет кнопок задаётся в админке ("Внешний вид") и применяется через CSS-переменные
// --accent-100..700, на которые в index.css перенаправлены все классы amber-*.

export const DEFAULT_ACCENT = "#f59e0b";

// Готовые цвета акцента (хорошо читаются с чёрным текстом на кнопках).
export const ACCENT_PRESETS = [
  { name: "Янтарь", hex: "#f59e0b" },
  { name: "Оранжевый", hex: "#f97316" },
  { name: "Красный", hex: "#ef4444" },
  { name: "Роза", hex: "#ec4899" },
  { name: "Фиолетовый", hex: "#8b5cf6" },
  { name: "Синий", hex: "#3b82f6" },
  { name: "Бирюзовый", hex: "#14b8a6" },
  { name: "Зелёный", hex: "#22c55e" },
  { name: "Лайм", hex: "#84cc16" },
];

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function hexToHsl(hex) {
  let h = String(hex || "").replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return { h: 38, s: 92, l: 50 }; // fallback ~ amber
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let sat = 0;
  const lig = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    sat = lig > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = (g - b) / d + (g < b ? 6 : 0); break;
      case g: hue = (b - r) / d + 2; break;
      default: hue = (r - g) / d + 4;
    }
    hue /= 6;
  }
  return { h: hue * 360, s: sat * 100, l: lig * 100 };
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

// Генерируем палитру 100..700 из одного базового цвета (его принимаем за 500).
export function accentShades(hex) {
  const { h, s, l } = hexToHsl(hex);
  const at = (dl) => hslToHex(h, s, clamp(l + dl, 4, 96));
  return {
    100: at(36), 200: at(28), 300: at(18),
    400: at(8), 500: at(0), 600: at(-9), 700: at(-17),
  };
}

const ACCENT_KEYS = [100, 200, 300, 400, 500, 600, 700];

// Применить акцент к документу. Пусто/дефолт -> вернуть штатный amber из CSS.
export function applyAccent(hex) {
  const root = document.documentElement;
  if (!hex || String(hex).toLowerCase() === DEFAULT_ACCENT) {
    ACCENT_KEYS.forEach((k) => root.style.removeProperty(`--accent-${k}`));
    return;
  }
  const sh = accentShades(hex);
  ACCENT_KEYS.forEach((k) => root.style.setProperty(`--accent-${k}`, sh[k]));
}

// Фоны-пресеты (без загрузки фото). key хранится в settings.home_background / menu_background.
export const BG_PRESETS = [
  {
    key: "",
    label: "Блики света",
    css:
      "radial-gradient(70% 55% at 15% 8%, rgba(255,255,255,.10), transparent 60%)," +
      "radial-gradient(60% 45% at 88% 12%, rgba(245,205,140,.14), transparent 60%)," +
      "radial-gradient(85% 75% at 75% 105%, rgba(120,140,255,.12), transparent 60%)," +
      "linear-gradient(160deg,#0c0c10,#16161c)",
  },
  {
    key: "preset:coffee",
    label: "Кофе",
    css:
      "radial-gradient(65% 50% at 20% 10%, rgba(214,160,90,.18), transparent 60%)," +
      "radial-gradient(70% 60% at 85% 100%, rgba(120,70,40,.30), transparent 60%)," +
      "linear-gradient(160deg,#1b140f,#241a12)",
  },
  {
    key: "preset:aurora",
    label: "Аврора",
    css:
      "radial-gradient(60% 50% at 15% 10%, rgba(80,220,180,.20), transparent 60%)," +
      "radial-gradient(60% 50% at 90% 20%, rgba(150,90,255,.22), transparent 60%)," +
      "radial-gradient(80% 70% at 60% 110%, rgba(60,120,255,.18), transparent 60%)," +
      "linear-gradient(160deg,#0a0e14,#0f1622)",
  },
  {
    key: "preset:ocean",
    label: "Океан",
    css:
      "radial-gradient(70% 55% at 20% 12%, rgba(80,180,255,.20), transparent 60%)," +
      "radial-gradient(70% 60% at 85% 100%, rgba(30,90,160,.30), transparent 60%)," +
      "linear-gradient(160deg,#0a1018,#0e1a26)",
  },
  {
    key: "preset:sunset",
    label: "Закат",
    css:
      "radial-gradient(65% 50% at 20% 12%, rgba(255,180,90,.22), transparent 60%)," +
      "radial-gradient(70% 60% at 85% 100%, rgba(220,60,120,.26), transparent 60%)," +
      "linear-gradient(160deg,#160f14,#241319)",
  },
  {
    key: "preset:noir",
    label: "Нуар",
    css:
      "radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,.06), transparent 60%)," +
      "linear-gradient(160deg,#0a0a0b,#111114)",
  },
];

// По значению из настроек вернуть стиль фона + флаг (картинка это или пресет).
export function resolveBackground(value) {
  const v = value || "";
  if (v.startsWith("/uploads") || v.startsWith("http")) {
    return { style: { backgroundImage: `url(${v})` }, isImage: true };
  }
  const preset = BG_PRESETS.find((p) => p.key === v) || BG_PRESETS[0];
  return { style: { backgroundImage: preset.css }, isImage: false };
}
