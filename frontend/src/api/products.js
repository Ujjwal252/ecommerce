// frontend/src/api/products.js
import apiClient from "./client";

/**
 * Get all products (public)
 */
export async function getProducts() {
  const res = await apiClient.get("/products");
  return res.data;
}

/**
 * Get single product by id
 */
export async function getProductById(id) {
  const res = await apiClient.get(`/products/${id}`);
  return res.data;
}

/**
 * Create new product (ADMIN ONLY)
 */
export async function createProduct(data) {
  const res = await apiClient.post("/products", data);
  return res.data;
}

/**
 * Update product (ADMIN ONLY)
 */
export async function updateProduct(id, data) {
  const res = await apiClient.put(`/products/${id}`, data);
  return res.data;
}

/**
 * Delete product (ADMIN ONLY)
 */
export async function deleteProduct(id) {
  const res = await apiClient.delete(`/products/${id}`);
  return res.data;
}
