import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, saveAuth } from "../api/auth";
import { setAuthToken } from "../api/client";
import { showToast } from "../ui/toast";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      // loginUser may throw Error (see src/api/auth.js)
      const data = await loginUser(form);

      // Save token + user to localStorage and attach header for future requests
      saveAuth(data);
      setAuthToken(data.token);
      // after saving token+user
      window.dispatchEvent(new Event('authChange'));

      // Feedback + redirect
      showToast("Login successful!");
      navigate("/"); // go to home
    } catch (err) {
      // err is an Error instance from the api layer (friendly message in err.message)
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "400px" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              style={{ width: "100%", padding: "6px", marginTop: "4px" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              style={{ width: "100%", padding: "6px", marginTop: "4px" }}
            />
          </label>
        </div>

        {error && (
          <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
