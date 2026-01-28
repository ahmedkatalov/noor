// Для Docker и сервера самый правильный вариант:
// API_URL пустой => запросы идут на текущий домен:
// /api/... и /uploads/... проксируются nginx -> backend
export const API_URL = "";

/**
 * GET JSON
 */
export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API GET error");
  }
  return res.json();
}

/**
 * POST JSON
 */
export async function apiPost(path, body, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API POST error");
  }

  return res.json();
}

/**
 * PUT JSON
 */
export async function apiPut(path, body, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API PUT error");
  }

  return res.json();
}

/**
 * DELETE
 */
export async function apiDelete(path, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API DELETE error");
  }

  return res.json();
}

/**
 * Upload file (multipart/form-data)
 * server expects form field name = "file"
 */
export async function apiUpload(path, file, token) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: form
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API UPLOAD error");
  }

  return res.json();
}
