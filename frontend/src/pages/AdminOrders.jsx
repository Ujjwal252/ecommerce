// frontend/src/pages/AdminOrders.jsx
import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../api/orders";

const STATUS_OPTIONS = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");
      const data = await getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load all orders (admin) error:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleStatusChange(orderId, newStatus) {
    try {
      setSavingId(orderId);
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("Update order status error:", err);
      alert(
        err?.response?.data?.message ||
          err.message ||
          "Failed to update status"
      );
    } finally {
      setSavingId(null);
    }
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
        return "#6b7280";
    }
  };

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
        <h2 className="page-title">Admin: Orders</h2>
        <p>No orders found.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Admin: Orders</h2>
        <button className="btn btn-secondary" onClick={loadOrders}>
          Refresh
        </button>
      </div>

      <div
        style={{
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
                {order.user && (
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {order.user.name} ({order.user.email})
                  </div>
                )}
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ marginBottom: 6 }}>
                  <span
                    style={{
                      fontSize: 12,
                      marginRight: 6,
                    }}
                  >
                    Status:
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value)
                    }
                    disabled={savingId === order.id}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 999,
                      border: `1px solid ${statusColor(order.status)}`,
                      color: statusColor(order.status),
                      fontSize: 12,
                      background: "#fff",
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ fontWeight: 700 }}>
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
