import { useEffect, useState } from "react";
import { showToast } from "../ui/toast";

import {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../api/products";

export default function AdminProducts() {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: 0,
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false); // create / update loading
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null); // null = create mode

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "stock" || name === "price" ? Number(value) : value,
    }));
  }

  async function loadProducts() {
    try {
      setListLoading(true);
      setError("");
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load products error:", err);
      setError(err.message || "Failed to load products");
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function resetForm() {
    setForm({
      name: "",
      price: "",
      category: "",
      stock: 0,
    });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.price) {
      setError("Name and price are required");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // UPDATE existing product
        await updateProduct(editingId, form);
        showToast("Product updated!");
      } else {
        // CREATE new product
        await createProduct(form);
        showToast("Product created!");
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      console.error("Save product error:", err);
      setError(
        err.message || "Failed to save product (admin only)."
      );
    } finally {
      setLoading(false);
    }
  }

  function startEdit(product) {
    setEditingId(product.id); // agar backend _id bhejta ho to yaha product._id karo
    setForm({
      name: product.name || "",
      price: product.price || 0,
      category: product.category || "",
      stock: product.stock ?? 0,
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      setLoading(true);
      await deleteProduct(id);
      await loadProducts();
    } catch (err) {
      console.error("Delete product error:", err);
      setError(err.message || "Failed to delete product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Admin: Manage Products</h2>

      <div style={{ display: "flex", gap: "40px", alignItems: "flex-start" }}>
        {/* Form */}
        <form onSubmit={handleSubmit} style={{ maxWidth: "320px" }}>
          <h3>{editingId ? "Edit Product" : "Add New Product"}</h3>

          <div style={{ marginBottom: "8px" }}>
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                style={{ width: "100%", padding: "6px", marginTop: "4px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label>
              Price:
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                style={{ width: "100%", padding: "6px", marginTop: "4px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label>
              Category:
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                style={{ width: "100%", padding: "6px", marginTop: "4px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label>
              Stock:
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                style={{ width: "100%", padding: "6px", marginTop: "4px" }}
              />
            </label>
          </div>

          {error && (
            <p style={{ color: "red", marginBottom: "8px" }}>{error}</p>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: "8px 16px", cursor: "pointer" }}
            >
              {loading
                ? editingId
                  ? "Saving..."
                  : "Creating..."
                : editingId
                ? "Save Changes"
                : "Create Product"}
            </button>

            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* List */}
        <div style={{ flex: 1 }}>
          <h3>Existing Products</h3>

          {listLoading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p>No products yet.</p>
          ) : (
            <ul>
              {products.map((p) => (
                <li key={p.id} style={{ marginBottom: 6 }}>
                  {p.name} — ₹{p.price} (Stock: {p.stock}){" "}
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() => startEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    style={{ marginLeft: 4 }}
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
