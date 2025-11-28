import { authHeader } from "./auth";

const API = process.env.NEXT_PUBLIC_API;

// low-level http
async function http(path, { method = "GET", body, headers, auth = false, cache = "no-store" } = {}) {
  const url = `${API}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? authHeader() : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export const apiGet  = (path, opts = {}) => http(path, { ...opts, method: "GET" });
export const apiPost = (path, body, opts = {}) => http(path, { ...opts, method: "POST", body });
export const apiPut  = (path, body, opts = {}) => http(path, { ...opts, method: "PUT", body });
export const apiPatch = (path, body, opts = {}) => http(path, { ...opts, method: "PATCH", body }); // ✅ tambahkan ini
export const apiDel  = (path, opts = {}) => http(path, { ...opts, method: "DELETE" });

// Admin endpoints (contoh)
export const getDashboard = (date) =>
  apiGet(`/admin/dashboard${date ? `?date=${date}` : ""}`, { auth: true });
export const getDiscounts = () => apiGet("/admin/discounts", { auth: true });
export const createDiscount = (payload) => apiPost("/admin/discounts", payload, { auth: true });
export const updateDiscount = (id, payload) => apiPatch(`/admin/discounts/${id}`, payload, { auth: true });
export const deleteDiscount = (id) => apiDel(`/admin/discounts/${id}`, { auth: true });

export const getCourts = () => apiGet("/admin/courts", { auth: true });
export const getBooking = () => apiGet("/admin/bookings", { auth: true });
export const getSettings = () => apiGet("/admin/settings", { auth: true });
