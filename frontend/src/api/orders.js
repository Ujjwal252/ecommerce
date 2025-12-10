// frontend/src/api/orders.js
import apiClient from "./client";

/**
 * Create order from cart
 * @param {Array<{id: number|string, quantity: number}>} cartItems
 */
export async function createOrderFromCart(cartItems) {
  const items = cartItems.map((item) => ({
    productId: item.id,
    quantity: item.quantity,
  }));

  const res = await apiClient.post("/orders", { items });
  return res.data;
}

/**
 * Get logged-in user's orders
 */
export async function getMyOrders() {
  const res = await apiClient.get("/orders/my");
  return res.data;
}

/**
 * Get all orders (admin)
 */
export async function getAllOrders() {
  const res = await apiClient.get("/orders");
  return res.data;
}

/**
 * Update order status (admin)
 * @param {number|string} orderId
 * @param {string} status
 */
export async function updateOrderStatus(orderId, status) {
  const res = await apiClient.patch(`/orders/${orderId}/status`, { status });
  return res.data;
}
