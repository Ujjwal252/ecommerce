// frontend/src/pages/Checkout.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, getCartTotal, clearCart } from "../cart/cart";
import { createOrderFromCart } from "../api/orders";

export default function Checkout() {
  const navigate = useNavigate();
  const [cart] = useState(getCart());
  const [total] = useState(getCartTotal());

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    pincode: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (
      !form.name ||
      !form.email ||
      !form.address ||
      !form.city ||
      !form.pincode ||
      !form.phone
    ) {
      setError("Please fill all the fields.");
      return;
    }

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setSubmitting(true);

      // Backend ko sirf items chahiye
      const data = await createOrderFromCart(cart);
      console.log("Order created:", data);

      clearCart();
      window.dispatchEvent(new Event("cartChange"));

      alert("Order placed successfully!");
      navigate("/my-orders");
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!cart.length) {
    return (
      <div className="page-container">
        <h2 className="page-title">Checkout</h2>
        <p>Your cart is empty.</p>
        <button
          className="btn btn-secondary"
          style={{ marginTop: 12 }}
          onClick={() => navigate("/")}
        >
          ← Back to Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ display: "grid", gap: 20, gridTemplateColumns: "2fr 1.3fr" }}>
      {/* Left: Shipping form */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: 12 }}>
          Shipping Details
        </h2>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">Full Name</label>
            <input
              className="input"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="label">Address</label>
            <textarea
              className="input"
              rows={3}
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">City</label>
              <input
                className="input"
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="label">Pincode</label>
              <input
                className="input"
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Phone</label>
            <input
              className="input"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? "Placing order..." : "Place Order"}
          </button>
        </form>
      </div>

      {/* Right: Order summary */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: 12 }}>
          Order Summary
        </h3>

        <div style={{ maxHeight: 260, overflowY: "auto", marginBottom: 12 }}>
          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                fontSize: 14,
              }}
            >
              <div>
                <div>{item.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Qty: {item.quantity} × ₹{item.price}
                </div>
              </div>
              <div style={{ fontWeight: 600 }}>
                ₹{item.price * item.quantity}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontWeight: 500 }}>Total</span>
          <span style={{ fontWeight: 700, fontSize: 18 }}>₹{total}</span>
        </div>
      </div>
    </div>
  );
}
