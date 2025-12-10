// frontend/src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { setAuthToken } from "../api/client";
import { clearAuth, getUser } from "../api/auth";
import { useEffect, useState } from "react";
import { getCartItemCount } from "../cart/cart";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [cartCount, setCartCount] = useState(getCartItemCount());
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });

  // Sync auth + cart
  useEffect(() => {
    function syncAll() {
      setUser(getUser());
      setCartCount(getCartItemCount());
    }

    window.addEventListener("storage", syncAll);
    window.addEventListener("authChange", syncAll);
    window.addEventListener("cartChange", syncAll);

    return () => {
      window.removeEventListener("storage", syncAll);
      window.removeEventListener("authChange", syncAll);
      window.removeEventListener("cartChange", syncAll);
    };
  }, []);

  // Apply theme to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  function logout() {
    clearAuth();
    setAuthToken(null);
    window.dispatchEvent(new Event("authChange"));
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Left Section */}
        <div className="navbar-brand">
          <Link to="/">E‑Commerce</Link>
        </div>

        {/* Right Section */}
        <nav className="navbar-links">
          {/* Theme toggle */}
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => setDarkMode((prev) => !prev)}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            style={{
              padding: "6px 10px",
              borderRadius: "999px",
              border: "1px solid #e5e7eb",
              fontSize: 14,
            }}
          >
            🛒 Cart: {cartCount}
          </Link>

          {user ? (
            <>
              {/* User Orders */}
              <Link to="/my-orders">My Orders</Link>

              {/* Admin Section */}
              {user.isAdmin && (
                <>
                  <Link to="/admin/dashboard">Admin Dashboard</Link>
                  <Link to="/admin/products">Admin Products</Link>
                  <Link to="/admin/orders">Admin Orders</Link>
                </>
              )}

              {/* User Name */}
              <span style={{ fontWeight: 500 }}>Hi, {user.name}</span>

              {/* Logout Button */}
              <button className="btn btn-secondary" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
