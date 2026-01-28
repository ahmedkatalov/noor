import { useEffect, useMemo, useState } from "react";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  apiUpload,
  API_URL
} from "../api/client.js";
import AdminGuard from "../components/AdminGuard.jsx";

/** UI */
function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-4 py-2 rounded-2xl border transition font-semibold",
        active
          ? "bg-white text-black border-white"
          : "bg-white/10 text-white border-white/20 hover:bg-white/15"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Card({ title, children, right }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-white">{title}</h2>
        {right}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      className="h-12 px-4 rounded-xl bg-black/40 border border-white/10 outline-none text-white w-full"
      value={value}
      placeholder={placeholder}
      type={type}
      onChange={onChange}
    />
  );
}

function Textarea({ value, onChange, placeholder }) {
  return (
    <textarea
      className="min-h-[90px] px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none text-white w-full"
      value={value}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
}

function FileButton({ label, disabled, onPick }) {
  return (
    <label
      className={[
        "inline-flex items-center justify-center w-full px-4 py-3 rounded-xl",
        "border border-white/20 bg-white/10 hover:bg-white/15 cursor-pointer transition text-center",
        disabled ? "opacity-40 pointer-events-none" : ""
      ].join(" ")}
    >
      <span className="text-sm text-white font-medium">{label}</span>
      <input
        type="file"
        accept="image/*,image/gif"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("ADMIN_TOKEN") || "");
  const [tab, setTab] = useState("appearance"); // appearance | menu

  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);

  // ДИНАМИЧЕСКИЕ КАТЕГОРИИ (пока будет через /api/categories — добавим ниже)
  const [cats, setCats] = useState([]); // [{id,name, parent_id:null|id}]
  const [loading, setLoading] = useState(false);

  // форма товара
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",     // будет id родителя
    subcategory_id: "",  // будет id ребенка
    image_url: ""
  });

  // фильтрация админ-списка
  const [search, setSearch] = useState("");
  const [adminCat, setAdminCat] = useState(""); // category_id
  const [adminSub, setAdminSub] = useState(""); // subcategory_id

  // настройки/внешний вид (редактируем локально и сохраняем кнопкой)
  const [draft, setDraft] = useState({
    brand_name: "",
    whatsapp_phone: "",
    currency: "₽",
    home_background: "",
    menu_background: "",
    logo_url: ""
  });

  // менеджер категорий
  const [newCatName, setNewCatName] = useState("");
  const [newSubName, setNewSubName] = useState("");
  const [selectedCatForSub, setSelectedCatForSub] = useState("");

  const canUse = useMemo(() => token && token.length > 0, [token]);

  async function refreshAll() {
    const [s, p, c] = await Promise.all([
      apiGet("/api/settings"),
      apiGet("/api/products"),
      apiGet("/api/categories") // добавим на бэке
    ]);

    setSettings(s || null);
    setDraft({
      brand_name: s?.brand_name || "",
      whatsapp_phone: s?.whatsapp_phone || "",
      currency: s?.currency || "₽",
      home_background: s?.home_background || "",
      menu_background: s?.menu_background || "",
      logo_url: s?.logo_url || ""
    });

    setProducts(Array.isArray(p) ? p : []);
    setCats(Array.isArray(c) ? c : []);
  }

  useEffect(() => {
    refreshAll().catch(console.error);
  }, []);

  /** uploads -> only set draft fields */
  async function uploadAndSetDraft(field, file) {
    if (!canUse) return;
    setLoading(true);
    try {
      const up = await apiUpload("/api/admin/upload", file, token);
      setDraft((d) => ({ ...d, [field]: up.url }));
    } catch (e) {
      console.error(e);
      alert("Ошибка загрузки файла");
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!canUse) return;
    setLoading(true);
    try {
      await apiPut("/api/admin/settings", draft, token);
      await refreshAll();
      alert("Сохранено ✅");
    } catch (e) {
      console.error(e);
      alert("Ошибка сохранения настроек");
    } finally {
      setLoading(false);
    }
  }

  async function uploadProductImage(file) {
    if (!canUse) return;
    setLoading(true);
    try {
      const up = await apiUpload("/api/admin/upload", file, token);
      setForm((f) => ({ ...f, image_url: up.url }));
    } catch (e) {
      console.error(e);
      alert("Ошибка загрузки фото товара");
    } finally {
      setLoading(false);
    }
  }

  async function createProduct() {
    if (!canUse) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category_id: form.category_id ? Number(form.category_id) : null,
      subcategory_id: form.subcategory_id ? Number(form.subcategory_id) : null,
      image_url: form.image_url || ""
    };

    if (!payload.name || !payload.price || payload.price <= 0) {
      alert("Заполни название и цену!");
      return;
    }
    if (!payload.category_id) {
      alert("Выбери категорию!");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/api/admin/products", payload, token);
      setForm({
        name: "",
        description: "",
        price: "",
        category_id: "",
        subcategory_id: "",
        image_url: ""
      });
      await refreshAll();
    } catch (e) {
      console.error(e);
      alert("Ошибка добавления товара");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id) {
    if (!canUse) return;
    const ok = confirm("Удалить товар?");
    if (!ok) return;

    setLoading(true);
    try {
      await apiDelete(`/api/admin/products/${id}`, token);
      await refreshAll();
    } catch (e) {
      console.error(e);
      alert("Ошибка удаления");
    } finally {
      setLoading(false);
    }
  }

  /** Категории CRUD */
  async function createCategory(name, parent_id) {
    if (!canUse) return;
    const nm = (name || "").trim();
    if (!nm) return;

    setLoading(true);
    try {
      await apiPost("/api/admin/categories", { name: nm, parent_id }, token);
      setNewCatName("");
      setNewSubName("");
      await refreshAll();
    } catch (e) {
      console.error(e);
      alert("Ошибка добавления категории");
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(id) {
    if (!canUse) return;
    const ok = confirm("Удалить? Подкатегории тоже удалятся.");
    if (!ok) return;

    setLoading(true);
    try {
      await apiDelete(`/api/admin/categories/${id}`, token);
      await refreshAll();
    } catch (e) {
      console.error(e);
      alert("Ошибка удаления категории");
    } finally {
      setLoading(false);
    }
  }

  /** helpers */
  const rootCats = useMemo(() => cats.filter((c) => !c.parent_id), [cats]);
  const subsByCat = useMemo(() => {
    const map = {};
    cats.forEach((c) => {
      if (c.parent_id) {
        map[c.parent_id] = map[c.parent_id] || [];
        map[c.parent_id].push(c);
      }
    });
    return map;
  }, [cats]);

  const currentSubsForForm = useMemo(() => {
    const cid = Number(form.category_id || 0);
    return subsByCat[cid] || [];
  }, [form.category_id, subsByCat]);

  const adminFilteredProducts = useMemo(() => {
    let list = Array.isArray(products) ? products : [];

    if (adminCat) list = list.filter((p) => String(p.category_id || "") === String(adminCat));
    if (adminSub) list = list.filter((p) => String(p.subcategory_id || "") === String(adminSub));

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((p) => (p.name || "").toLowerCase().includes(s));
    }
    return list;
  }, [products, adminCat, adminSub, search]);

  const brandPreview = (draft.brand_name || "").trim() || "Название кофейни";

  return (
    <AdminGuard token={token} onSaveToken={setToken}>
      <div className="min-h-screen w-screen bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Админка</h1>
              <p className="text-white/65 mt-2">
                {loading ? "Загрузка..." : "Управление внешним видом и меню"}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <TabButton active={tab === "appearance"} onClick={() => setTab("appearance")}>
                Внешний вид
              </TabButton>
              <TabButton active={tab === "menu"} onClick={() => setTab("menu")}>
                Меню
              </TabButton>
            </div>
          </div>

          {/* CONTENT */}
          {tab === "appearance" ? (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">

              {/* LEFT: text settings */}
              <div className="space-y-5">
                <Card title="Основные настройки">
                  <div className="space-y-3">
                    <Input
                      value={draft.brand_name}
                      placeholder="Название кофейни (Brand)"
                      onChange={(e) => setDraft((d) => ({ ...d, brand_name: e.target.value }))}
                    />
                    <Input
                      value={draft.whatsapp_phone}
                      placeholder="WhatsApp номер (пример: 7928...)"
                      onChange={(e) => setDraft((d) => ({
                        ...d,
                        whatsapp_phone: e.target.value.replace(/[^\d]/g, "")
                      }))}
                    />
                    <Input
                      value={draft.currency}
                      placeholder="Валюта (например ₽)"
                      onChange={(e) => setDraft((d) => ({ ...d, currency: e.target.value }))}
                    />

                    <div className="text-xs text-white/50 leading-relaxed">
                      Превью: <span className="text-white/80 font-semibold">{brandPreview}</span>
                    </div>

                    <button
                      onClick={saveSettings}
                      disabled={!canUse || loading}
                      className="w-full px-5 py-3 rounded-2xl bg-white text-black font-bold disabled:opacity-40 transition hover:scale-[1.01]"
                    >
                      Сохранить настройки
                    </button>
                  </div>
                </Card>

                <Card title="Логотип">
                  <div className="space-y-3">
                    {draft.logo_url ? (
                      <img
                        src={`${API_URL}${draft.logo_url}`}
                        className="w-full h-44 rounded-xl object-cover border border-white/10"
                        alt="logo"
                      />
                    ) : (
                      <div className="w-full h-44 rounded-xl bg-white/10" />
                    )}

                    <FileButton
                      label="Загрузить логотип"
                      disabled={!canUse || loading}
                      onPick={(file) => uploadAndSetDraft("logo_url", file)}
                    />
                  </div>
                </Card>
              </div>

              {/* RIGHT: backgrounds */}
              <div className="space-y-5">
                <Card title="Фон главной страницы">
                  <div className="space-y-3">
                    {draft.home_background ? (
                      <img
                        src={`${API_URL}${draft.home_background}`}
                        className="w-full h-56 rounded-xl object-cover border border-white/10"
                        alt="home"
                      />
                    ) : (
                      <div className="w-full h-56 rounded-xl bg-white/10" />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FileButton
                        label="Выбрать фото/гиф"
                        disabled={!canUse || loading}
                        onPick={(file) => uploadAndSetDraft("home_background", file)}
                      />
                      <button
                        disabled={!canUse || loading}
                        onClick={() => setDraft((d) => ({ ...d, home_background: "" }))}
                        className="px-4 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 transition font-semibold"
                      >
                        Убрать фон
                      </button>
                    </div>
                  </div>
                </Card>

                <Card title="Фон меню">
                  <div className="space-y-3">
                    {draft.menu_background ? (
                      <img
                        src={`${API_URL}${draft.menu_background}`}
                        className="w-full h-56 rounded-xl object-cover border border-white/10"
                        alt="menu"
                      />
                    ) : (
                      <div className="w-full h-56 rounded-xl bg-white/10" />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FileButton
                        label="Выбрать фото/гиф"
                        disabled={!canUse || loading}
                        onPick={(file) => uploadAndSetDraft("menu_background", file)}
                      />
                      <button
                        disabled={!canUse || loading}
                        onClick={() => setDraft((d) => ({ ...d, menu_background: "" }))}
                        className="px-4 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 transition font-semibold"
                      >
                        Убрать фон
                      </button>
                    </div>
                  </div>
                </Card>

                <div className="text-xs text-white/45">
                  Важно: изменения сохраняются после кнопки <b>“Сохранить настройки”</b>.
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-6">

              {/* Categories Manager */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card
                  title="Категории (фильтры)"
                  right={
                    <button
                      className="text-xs px-3 py-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 transition"
                      onClick={() => refreshAll().catch(console.error)}
                      disabled={loading}
                    >
                      Обновить
                    </button>
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      value={newCatName}
                      placeholder="Новая категория (например: Кофе)"
                      onChange={(e) => setNewCatName(e.target.value)}
                    />
                    <button
                      disabled={!canUse || loading || !newCatName.trim()}
                      onClick={() => createCategory(newCatName, null)}
                      className="px-4 py-3 rounded-xl bg-white text-black font-bold disabled:opacity-40 transition"
                    >
                      Добавить
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    {rootCats.length === 0 ? (
                      <div className="text-white/60 text-sm">Категорий пока нет.</div>
                    ) : (
                      rootCats.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                        >
                          <div className="font-semibold">{c.name}</div>
                          <button
                            disabled={!canUse || loading}
                            onClick={() => deleteCategory(c.id)}
                            className="text-sm px-3 py-2 rounded-xl bg-red-500/90 hover:bg-red-500 transition disabled:opacity-40"
                          >
                            Удалить
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card title="Подкатегории">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      className="h-12 px-4 rounded-xl bg-black/40 border border-white/10 outline-none text-white w-full"
                      value={selectedCatForSub}
                      onChange={(e) => setSelectedCatForSub(e.target.value)}
                    >
                      <option value="">Выбери категорию…</option>
                      {rootCats.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <Input
                      value={newSubName}
                      placeholder="Подкатегория (например: Американо)"
                      onChange={(e) => setNewSubName(e.target.value)}
                    />

                    <button
                      disabled={!canUse || loading || !selectedCatForSub || !newSubName.trim()}
                      onClick={() => createCategory(newSubName, Number(selectedCatForSub))}
                      className="sm:col-span-2 px-4 py-3 rounded-xl bg-white text-black font-bold disabled:opacity-40 transition"
                    >
                      Добавить подкатегорию
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    {selectedCatForSub ? (
                      (subsByCat[Number(selectedCatForSub)] || []).length === 0 ? (
                        <div className="text-white/60 text-sm">Подкатегорий пока нет.</div>
                      ) : (
                        (subsByCat[Number(selectedCatForSub)] || []).map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                          >
                            <div className="font-semibold">{s.name}</div>
                            <button
                              disabled={!canUse || loading}
                              onClick={() => deleteCategory(s.id)}
                              className="text-sm px-3 py-2 rounded-xl bg-red-500/90 hover:bg-red-500 transition disabled:opacity-40"
                            >
                              Удалить
                            </button>
                          </div>
                        ))
                      )
                    ) : (
                      <div className="text-white/60 text-sm">Сначала выбери категорию.</div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Add product */}
              <Card title="Добавить товар">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={form.name}
                    placeholder="Название"
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />

                  <Input
                    value={form.price}
                    placeholder={`Цена (${settings?.currency || "₽"})`}
                    type="number"
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  />

                  <div className="md:col-span-2">
                    <Textarea
                      value={form.description}
                      placeholder="Описание"
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>

                  {/* category */}
                  <select
                    className="h-12 px-4 rounded-xl bg-black/40 border border-white/10 outline-none text-white w-full"
                    value={form.category_id}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category_id: e.target.value, subcategory_id: "" }))
                    }
                  >
                    <option value="">Категория…</option>
                    {rootCats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* subcategory */}
                  <select
                    className="h-12 px-4 rounded-xl bg-black/40 border border-white/10 outline-none text-white w-full"
                    value={form.subcategory_id}
                    onChange={(e) => setForm((f) => ({ ...f, subcategory_id: e.target.value }))}
                    disabled={!form.category_id}
                  >
                    <option value="">Подкатегория (необязательно)…</option>
                    {currentSubsForForm.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  {/* photo */}
                  <div className="rounded-xl bg-black/30 border border-white/10 p-3 md:col-span-2">
                    <div className="text-sm font-semibold text-white/80">Фото товара</div>

                    {form.image_url ? (
                      <img
                        src={`${API_URL}${form.image_url}`}
                        className="mt-2 w-full h-40 rounded-xl object-cover"
                        alt="product"
                      />
                    ) : (
                      <div className="mt-2 w-full h-40 rounded-xl bg-white/10" />
                    )}

                    <div className="mt-3">
                      <FileButton
                        label="Выбрать фото"
                        disabled={!canUse || loading}
                        onPick={(file) => uploadProductImage(file)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={createProduct}
                  disabled={!canUse || loading || !form.name.trim() || !form.price || !form.category_id}
                  className="mt-5 w-full md:w-auto px-6 py-3 rounded-2xl bg-white text-black font-bold disabled:opacity-40 transition hover:scale-[1.01]"
                >
                  Добавить товар
                </button>
              </Card>

              {/* product list */}
              <Card title="Товары">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px] gap-3">
                  <Input
                    value={search}
                    placeholder="Поиск по названию…"
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <select
                    className="h-12 px-4 rounded-xl bg-black/40 border border-white/10 outline-none text-white w-full"
                    value={adminCat}
                    onChange={(e) => {
                      setAdminCat(e.target.value);
                      setAdminSub("");
                    }}
                  >
                    <option value="">Все категории</option>
                    {rootCats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="h-12 px-4 rounded-xl bg-black/40 border border-white/10 outline-none text-white w-full"
                    value={adminSub}
                    onChange={(e) => setAdminSub(e.target.value)}
                    disabled={!adminCat}
                  >
                    <option value="">Все подкатегории</option>
                    {(subsByCat[Number(adminCat)] || []).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {adminFilteredProducts.map((p) => (
                    <div key={p.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                      <div className="flex gap-3">
                        {p.image_url ? (
                          <img
                            src={`${API_URL}${p.image_url}`}
                            alt={p.name}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-white/10" />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate">{p.name}</div>
                          <div className="text-white/70 text-sm line-clamp-2 mt-1">
                            {p.description}
                          </div>
                          <div className="mt-2 font-semibold">
                            {p.price} {settings?.currency || "₽"}
                          </div>
                        </div>
                      </div>

                      <button
                        className="mt-3 w-full px-4 py-2 rounded-xl bg-red-500/90 hover:bg-red-500 text-white disabled:opacity-40 transition"
                        disabled={!canUse || loading}
                        onClick={() => deleteProduct(p.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>

                {adminFilteredProducts.length === 0 && (
                  <div className="mt-8 text-center text-white/60">Товаров нет.</div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
