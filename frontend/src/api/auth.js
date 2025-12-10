// frontend/src/api/auth.js
import apiClient from "./client";

/**
 * Register a new user
 * @param {{name:string, email:string, password:string}} data
 * @returns {Promise<{user:object, token:string, message?:string}>}
 * @throws Error with friendly message on failure
 */
export async function registerUser(data) {
  try {
    const res = await apiClient.post("/auth/register", data);
    return res.data;
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Registration failed";
    throw new Error(message);
  }
}

/**
 * Login
 * @param {{email:string, password:string}} data
 * @returns {Promise<{user:object, token:string, message?:string}>}
 * @throws Error with friendly message on failure
 */
export async function loginUser(data) {
  try {
    const res = await apiClient.post("/auth/login", data);
    return res.data;
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Login failed";
    throw new Error(message);
  }
}

/**
 * Save auth data to localStorage (token + user)
 * @param {{token:string, user:object}} data
 */
export function saveAuth(data) {
  if (data?.token) localStorage.setItem("token", data.token);
  if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
}

/**
 * Clear auth data from localStorage
 */
export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

/**
 * Get saved token (or null)
 */
export function getToken() {
  return localStorage.getItem("token");
}

/**
 * Get saved user (or null)
 */
export function getUser() {
  const raw = localStorage.getItem("user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
