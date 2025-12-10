// frontend/src/pages/Cart.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, getCartTotal, clearCart } from "../cart/cart";

export default function Cart() {
  const navigate = useNavigate();

  const [items, setItems] = useState(getCart());
  const [total, setTotal] = useState(getCartTotal());
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Agar localStorage se koi aur tab/cart change kare
    function handleCartChange() {
      setItems(getCart());
      setTotal(getCartTotal());
    }

    window.addEventListener("cartChange", handleCartChange);
    window.addEventListener("storage", handleCartChange);

    return () => {
      window.removeEventListener("cartChange", handleCartChange);
      window.removeEventListener("storage", handleCartChange);
    };
  }, []);

  function syncCart(newItems) {
    setItems(newItems);
    const newTotal = newItems.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );
    setTotal(newTotal);

    // localStorage update (same key jaisa cart helper use karta hai)
    localStorage.setItem("cart", JSON.stringify(newItems));
    window.dispatchEvent(new Event("cartChange"));
  }

  function handleQtyChange(id, value) {
    const qty = Number(value);
    if (Number.isNaN(qty) || qty <= 0) return;

    setUpdating(true);
    const newItems = items.map((it) =>
      it.id === id ? { ...it, quantity: qty } : it
    );
    syncCart(newItems);
    setUpdating(false);
  }

  function handleRemove(id) {
    const newItems = items.filter((it) => it.id !== id);
    syncCart(newItems);
  }

  function handleClearCart() {
    clearCart();
    syncCart([]);
  }

  function handleCheckout() {
    if (!items.length) return;
    navigate("/checkout");
  }

  if (!items.length) {
    return (
      <div className="page-container">
        <h2 className="page-title">Your Cart</h2>
        <p>Cart is empty.</p>
        <button
          className="btn btn-secondary"
          style={{ marginTop: 12 }}
          onClick={() => navigate("/")}
        >
          ← Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Your Cart</h2>
        <button
          className="btn btn-secondary"
          onClick={handleClearCart}
          disabled={updating}
        >
          Clear Cart
        </button>
      </div>

      <div className="card">
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr auto",
              gap: 12,
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div>
              <div style={{ fontWeight: 500 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Price: ₹{item.price}
              </div>
            </div>

            <div>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Quantity</span>
              <input
                type="number"
                min={1}
                className="input"
                value={item.quantity}
                onChange={(e) => handleQtyChange(item.id, e.target.value)}
                style={{ width: 80, marginTop: 4 }}
              />
            </div>

            <div style={{ fontWeight: 600 }}>
              ₹{item.price * item.quantity}
            </div>

            <div>
              <button
                className="btn btn-danger"
                onClick={() => handleRemove(item.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 10,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            Total: ₹{total}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/")}
            >
              ← Continue Shopping
            </button>
            <button
              className="btn btn-primary"
              onClick={handleCheckout}
              disabled={updating || !items.length}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
