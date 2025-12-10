// frontend/src/pages/ProductDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../api/products";
import { addToCart } from "../cart/cart";
import { showToast } from "../ui/toast";
import Skeleton from "../components/Skeleton";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  function handleQtyChange(e) {
    const value = Number(e.target.value);
    if (!Number.isNaN(value) && value > 0) {
      setQuantity(value);
    }
  }

  function handleAddToCart() {
    if (!product) return;

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
      },
      quantity
    );

    window.dispatchEvent(new Event("cartChange"));
    showToast("Added to cart", "success");
  }

  // 🔹 Yaha skeleton loading UI
  if (loading) {
    return (
      <div className="page-container">
        {/* Back button placeholder */}
        <Skeleton height="32px" width="110px" radius="999px" />

        <div
          className="card"
          style={{ display: "flex", gap: 24, alignItems: "flex-start", marginTop: 16 }}
        >
          {/* Left side image skeleton */}
          <div style={{ flex: "0 0 260px" }}>
            <Skeleton height="220px" width="100%" radius="16px" />
          </div>

          {/* Right side text skeletons */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
            <Skeleton height="24px" width="60%" />
            <Skeleton height="14px" width="30%" />
            <Skeleton height="22px" width="20%" />
            <Skeleton height="14px" width="40%" />
            <Skeleton height="60px" width="100%" radius="12px" />
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
              <Skeleton height="38px" width="90px" radius="10px" />
              <Skeleton height="38px" width="130px" radius="999px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: "red" }}>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ marginTop: 8 }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: 20 }}>
        <p>Product not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ marginTop: 8 }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary"
        style={{ marginBottom: 16 }}
      >
        ← Back
      </button>

      <div
        className="card"
        style={{ display: "flex", gap: 24, alignItems: "flex-start" }}
      >
        {/* Left side — image */}
        <div
          style={{
            flex: "0 0 260px",
            height: 220,
            borderRadius: 16,
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(16,185,129,0.12))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: 40, color: "#4b5563" }}>🛍️</span>
          )}
        </div>

        {/* Right side — details */}
        <div style={{ flex: 1 }}>
          <h2 className="card-title" style={{ marginBottom: 4 }}>
            {product.name}
          </h2>

          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
            {product.category || "Uncategorized"}
          </p>

          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            ₹{product.price}
          </p>

          <p
            style={{
              fontSize: 14,
              color: product.stock > 0 ? "#16a34a" : "#dc2626",
              marginBottom: 12,
            }}
          >
            {product.stock > 0
              ? `In stock: ${product.stock}`
              : "Out of stock"}
          </p>

          {product.description && (
            <p
              style={{
                fontSize: 14,
                color: "#4b5563",
                marginBottom: 16,
                lineHeight: 1.5,
              }}
            >
              {product.description}
            </p>
          )}

          {/* Quantity + Add to Cart */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <div className="form-group" style={{ maxWidth: 90 }}>
              <label className="label">Quantity</label>
              <input
                type="number"
                min={1}
                className="input"
                value={quantity}
                onChange={handleQtyChange}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
