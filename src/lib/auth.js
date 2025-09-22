// src/lib/auth.js

const KEY_TOKEN = "admin_token";
const KEY_ROLE  = "admin_role";

// storage helpers
function setStorageItem(key, val, remember) {
  const store = remember ? localStorage : sessionStorage;
  store.setItem(key, val);
  (remember ? sessionStorage : localStorage).removeItem(key);
}
function getAnyStorage(key) {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key) || sessionStorage.getItem(key) || null;
}

// public API
export function saveSession({ token, role, remember }) {
  if (typeof window === "undefined" || !token) return;
  setStorageItem(KEY_TOKEN, token, remember);
  if (role) setStorageItem(KEY_ROLE, role, remember);
  setStorageItem("token", token, remember); // kompat lama
}
export function clearSession() {
  if (typeof window === "undefined") return;
  [KEY_TOKEN, KEY_ROLE, "token"].forEach((k) => {
    localStorage.removeItem(k); sessionStorage.removeItem(k);
  });
}
export function getToken() {
  if (typeof window === "undefined") return null;
  return getAnyStorage(KEY_TOKEN) || getAnyStorage("token");
}
export function getRole() {
  if (typeof window === "undefined") return null;
  return getAnyStorage(KEY_ROLE);
}
export function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// base64url → json
function base64UrlToUint8Array(b64url) {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const str = atob(b64);
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr;
}
export function getUserFromToken(token) {
  try {
    if (!token) return null;
    const payload = token.split(".")[1];
    const json = new TextDecoder().decode(base64UrlToUint8Array(payload));
    return JSON.parse(json);
  } catch { return null; }
}

export function requireAuth() {
  const token = getToken();
  if (!token) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return false;
  }
  return true;
}
export function requireRole(roles = []) {
  if (!requireAuth()) return false;
  const user = getUserFromToken(getToken());
  const ok = user && roles.includes(user.role);
  if (!ok && typeof window !== "undefined") window.location.href = "/dashboard";
  return ok;
}

export async function authFetch(url, options = {}) {
  const headers = { ...(options.headers || {}), ...authHeader() };
  const res = await fetch(url, { ...options, headers });
  return res;
}
