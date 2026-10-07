import * as SecureStore from 'expo-secure-store';

// Set EXPO_PUBLIC_API_URL in .env (see README). On a real phone use your computer's LAN IP or the deployed URL.
const BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000/api';
const TOKEN_KEY = 'pm_token';

// Token lives in Android Keystore / iOS Keychain via expo-secure-store.
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);
export const setToken = (t) => SecureStore.setItemAsync(TOKEN_KEY, t);
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, status, details, offline = false) {
    super(message);
    this.status = status;
    this.details = details;
    this.offline = offline;
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);

export async function api(path, { method = 'GET', body, params, auth = true } = {}) {
  const qs = params
    ? '?' + Object.entries(params).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
    : '';
  const token = auth ? await getToken() : null;
  let res;
  try {
    res = await fetch(`${BASE}${path}${qs}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No internet connection. Check your network and pull down to retry.', 0, null, true);
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && auth) onUnauthorized(data.error || 'Your session expired. Please log in again.');
    throw new ApiError(data.error || 'Something went wrong', res.status, data.details);
  }
  return data;
}

export const fieldErrors = (err) =>
  Array.isArray(err?.details) ? Object.fromEntries(err.details.map((d) => [d.field, d.message])) : {};
