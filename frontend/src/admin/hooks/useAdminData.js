import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut, apiUpload } from "../../api/client.js";

export function useAdminData(token) {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);

  const canUse = useMemo(() => token && token.length > 0, [token]);

  async function refreshAll() {
    // Все три источника публичные (GET) — грузим их сразу, токен не нужен для чтения.
    const [s, p, c] = await Promise.all([
      apiGet("/api/settings"),
      apiGet("/api/products"),
      apiGet("/api/categories"),
    ]);

    setSettings(s || null);
    setProducts(Array.isArray(p) ? p : []);
    setCats(Array.isArray(c) ? c : []);
  }

  useEffect(() => {
    refreshAll().catch(console.error);
  }, [canUse]);

  async function upload(file) {
    if (!canUse) return null;
    setLoading(true);
    try {
      return await apiUpload("/api/admin/upload", file, token);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings(payload) {
    if (!canUse) return;
    setLoading(true);
    try {
      await apiPut("/api/admin/settings", payload, token);
      await refreshAll();
    } finally {
      setLoading(false);
    }
  }

  async function createProduct(payload) {
    if (!canUse) return;
    setLoading(true);
    try {
      await apiPost("/api/admin/products", payload, token);
      await refreshAll();
    } finally {
      setLoading(false);
    }
  }

  async function updateProduct(id, payload) {
    if (!canUse) return;
    setLoading(true);
    try {
      await apiPut(`/api/admin/products/${id}`, payload, token);
      await refreshAll();
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id) {
    if (!canUse) return;
    setLoading(true);
    try {
      await apiDelete(`/api/admin/products/${id}`, token);
      await refreshAll();
    } finally {
      setLoading(false);
    }
  }

  async function createCategory(name, parent_id) {
    if (!canUse) return;
    setLoading(true);
    try {
      await apiPost("/api/admin/categories", { name, parent_id }, token);
      await refreshAll();
    } finally {
      setLoading(false);
    }
  }

  async function deleteCategory(id) {
    if (!canUse) return;
    setLoading(true);
    try {
      await apiDelete(`/api/admin/categories/${id}`, token);
      await refreshAll();
    } finally {
      setLoading(false);
    }
  }

  async function setAvailability(id, is_available) {
    if (!canUse) return;
    setLoading(true);
    try {
      await apiPut(`/api/admin/products/${id}/availability`, { is_available }, token);
      await refreshAll();
    } finally {
      setLoading(false);
    }
  }

  return {
    canUse,
    loading,
    settings,
    products,
    cats,
    refreshAll,
    upload,
    saveSettings,
    createProduct,
    updateProduct,
    deleteProduct,
    createCategory,
    deleteCategory,
    setAvailability,
  };
}
