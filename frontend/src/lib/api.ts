/**
 * Centralized API configuration for Samadhan Portal.
 *
 * In development  → VITE_API_URL is empty → relative paths → Vite proxy works.
 * In production   → VITE_API_URL = "https://your-app.onrender.com" → full URLs.
 */

export const API_URL: string = import.meta.env.VITE_API_URL || "";

/** Build a full URL for an API endpoint. */
export const apiUrl = (path: string): string => `${API_URL}${path}`;

/**
 * Drop-in replacement for `fetch` that prepends the backend URL.
 * Usage:  apiFetch("/api/auth/login", { method: "POST", ... })
 */
export const apiFetch = (path: string, options?: RequestInit): Promise<Response> =>
  fetch(apiUrl(path), options);

/**
 * Resolve an asset path (e.g. `/uploads/profiles/photo.jpg`) to a full URL.
 * Google OAuth photos already start with "http" and are returned as-is.
 */
export const assetUrl = (path: string | undefined | null): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
};
