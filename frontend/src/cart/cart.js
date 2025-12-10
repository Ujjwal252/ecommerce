// frontend/src/cart/cart.js

const CART_KEY = "cart";

export function getCart() {
  const raw = localStorage.getItem(CART_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  // notify listeners
  window.dispatchEvent(new Event("cartChange"));
}

export function addToCart(product, quantity = 1) {
  const cart = getCart();
  const index = cart.findIndex((item) => item.id === product.id);

  if (index >= 0) {
    cart[index].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
  }

  saveCart(cart);
  return cart;
}

export function updateCartItemQuantity(id, quantity) {
  const cart = getCart();
  const idx = cart.findIndex((item) => item.id === id);
  if (idx === -1) return cart;

  if (quantity <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].quantity = quantity;
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(id) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function getCartItemCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}
