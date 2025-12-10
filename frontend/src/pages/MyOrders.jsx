// frontend/src/pages/MyOrders.jsx
import { useEffect, useState } from "react";
import { getMyOrders } from "../api/orders";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Load my orders error:", err);
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading orders...</p>;
  }

  if (error) {
    return (
      <p style={{ padding: 20, color: "red" }}>
        {error}
      </p>
    );
  }

  if (!orders.length) {
    return (
      <div className="page-container">
        <h2 className="page-title">My Orders</h2>
        <p>You have no orders yet.</p>
      </div>
    );
  }

  const statusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "#16a34a";
      case "SHIPPED":
        return "#2563eb";
      case "CANCELLED":
        return "#dc2626";
      case "PAID":
        return "#0891b2";
      default:
        return "#6b7280"; // PENDING etc.
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">My Orders</h2>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>Order #{order.id}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "2px 8px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 500,
                    background: "#f3f4f6",
                    color: statusColor(order.status),
                    border: `1px solid ${statusColor(order.status)}`,
                  }}
                >
                  {order.status}
                </div>
                <div style={{ marginTop: 4, fontWeight: 600 }}>
                  Total: ₹{order.totalPrice}
                </div>
              </div>
            </div>

            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                fontSize: 14,
                color: "#374151",
              }}
            >
              {order.items?.map((item) => (
                <li key={item.id}>
                  {item.product?.name || "Product"} × {item.quantity} — ₹
                  {item.price * item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
