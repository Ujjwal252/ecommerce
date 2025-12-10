// frontend/src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { getAdminDashboard } from "../api/admin";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getAdminDashboard();
        setStats(data);
      } catch (err) {
        console.error("Load admin dashboard error:", err);
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load admin dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <p style={{ padding: 20 }}>Loading dashboard...</p>;
  }

  if (error) {
    return (
      <p style={{ padding: 20, color: "red" }}>
        {error}
      </p>
    );
  }

  if (!stats) {
    return (
      <div className="page-container">
        <h2 className="page-title">Admin Dashboard</h2>
        <p>No data available.</p>
      </div>
    );
  }

  const {
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue,
    ordersByStatus,
  } = stats;

  // Helper: status ke hisaab se color
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
        return "#6b7280"; // PENDING / etc.
    }
  };

  const maxCount =
    ordersByStatus && ordersByStatus.length
      ? Math.max(...ordersByStatus.map((s) => s.count || 0)) || 1
      : 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Admin Dashboard</h2>
      </div>

      {/* Top summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div className="card">
          <div className="card-title">Total Users</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>
            {totalUsers}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Total Products</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>
            {totalProducts}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Total Orders</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>
            {totalOrders}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Total Revenue</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>
            ₹{Number(totalRevenue).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Orders by status + chart */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 8 }}>
          Orders by Status
        </div>

        {(!ordersByStatus || !ordersByStatus.length) && (
          <p style={{ fontSize: 14, color: "#6b7280" }}>No orders yet.</p>
        )}

        {ordersByStatus && ordersByStatus.length > 0 && (
          <>
            {/* Chips / tags */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 4,
                marginBottom: 12,
              }}
            >
              {ordersByStatus.map((item) => (
                <div
                  key={item.status}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    background: "#f9fafb",
                    minWidth: 120,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    {item.status}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>
                    {item.count}
                  </div>
                </div>
              ))}
            </div>

            {/* Simple horizontal bar chart */}
            <div
              style={{
                marginTop: 4,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {ordersByStatus.map((item) => {
                const widthPercent = (item.count / maxCount) * 100;

                return (
                  <div
                    key={item.status + "-bar"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 90,
                        fontSize: 12,
                        color: "#6b7280",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.status}
                    </span>

                    <div
                      style={{
                        flex: 1,
                        height: 8,
                        borderRadius: 999,
                        background: "rgba(148,163,184,0.35)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${widthPercent || 5}%`,
                          height: "100%",
                          borderRadius: 999,
                          background: statusColor(item.status),
                          transition: "width 0.25s ease-out",
                        }}
                      />
                    </div>

                    <span
                      style={{
                        width: 30,
                        textAlign: "right",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
