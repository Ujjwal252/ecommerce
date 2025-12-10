// frontend/src/pages/Home.jsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/products";
import { addToCart } from "../cart/cart";
import { showToast } from "../ui/toast";
import Skeleton from "../components/Skeleton";

const ITEMS_PER_PAGE = 6; // ek page pe kitne products dikhane hain

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Search + category filter
  const filteredProducts = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return products.filter((p) => {
      const matchesCategory =
        category === "ALL" || !p.category ? true : p.category === category;

      const matchesSearch =
        !searchText ||
        p.name?.toLowerCase().includes(searchText) ||
        p.category?.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  // Jab search ya category change ho, page = 1 reset
  useEffect(() => {
    setPage(1);
  }, [search, category]);

  // Pagination calculation
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  );

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, page]);

  function goToPage(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  }

  function handleAddToCart(product) {
    if (!product || product.stock <= 0) return;

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
      },
      1 // default quantity 1
    );

    window.dispatchEvent(new Event("cartChange"));
    showToast("Added to cart", "success");
  }

  return (
    <div className="page-container">
      {/* Top header + filters */}
      <div className="page-header">
        <h2 className="page-title">Products</h2>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Search box */}
          <input
            className="input"
            style={{ minWidth: 180 }}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Category dropdown */}
          <select
            className="input"
            style={{ minWidth: 140 }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="ALL">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🔹 Loading state – skeleton cards */}
      {loading && (
        <div className="product-grid" style={{ marginTop: 20 }}>
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <div key={i} className="card">
              <Skeleton height="140px" width="100%" radius="12px" />
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <Skeleton height="18px" width="70%" />
                <Skeleton height="14px" width="40%" />
                <Skeleton height="16px" width="50%" />
                <Skeleton height="32px" width="80px" radius="999px" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !loading && <p className="error-text">{error}</p>}

      {!loading && !error && filteredProducts.length === 0 && (
        <p>No products match your search.</p>
      )}

      {!loading && !error && filteredProducts.length > 0 && (
        <>
          {/* Products grid (current page only) */}
          <div className="product-grid">
            {paginatedProducts.map((p) => (
              <div key={p.id} className="card">
                {/* IMAGE */}
                <div
                  style={{
                    width: "100%",
                    height: 140,
                    borderRadius: 12,
                    marginBottom: 10,
                    overflow: "hidden",
                    background:
                      "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(16,185,129,0.12))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 32, color: "#6b7280" }}>🛍️</span>
                  )}
                </div>

                <div className="card-header">
                  <div className="card-title">{p.name}</div>
                  <div className="product-card-price">₹{p.price}</div>
                </div>

                <div style={{ fontSize: 13, color: "#6b7280" }}>
                  {p.category || "Uncategorized"}
                </div>

                <p
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                >
                  Stock: {p.stock}
                </p>

                <div className="product-card-footer">
                  <Link to={`/products/${p.id}`} className="btn btn-primary">
                    View details →
                  </Link>

                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => handleAddToCart(p)}
                    disabled={p.stock <= 0}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "center",
              gap: 8,
              alignItems: "center",
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
            >
              ◀ Prev
            </button>

            <span style={{ fontSize: 14 }}>
              Page {page} of {totalPages}
            </span>

            <button
              className="btn btn-secondary"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
            >
              Next ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
