const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'pm_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);

export async function api(path, { method = 'GET', body, params, auth = true } = {}) {
  const qs = params
    ? '?' + new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null)).toString()
    : '';
  let res;
  try {
    res = await fetch(`${BASE}${path}${qs}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(auth && getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your internet connection and try again.', 0);
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && auth) onUnauthorized(data.error || 'Your session expired. Please log in again.');
    throw new ApiError(data.error || 'Something went wrong', res.status, data.details);
  }
  return data;
}

// Turn backend validation details into { field: message }
export const fieldErrors = (err) =>
  Array.isArray(err?.details) ? Object.fromEntries(err.details.map((d) => [d.field, d.message])) : {};
