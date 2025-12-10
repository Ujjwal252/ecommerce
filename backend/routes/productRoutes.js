// backend/routes/productRoutes.js
const express = require("express");
const { Product } = require("../models");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

// GET /api/products → saare products
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(products);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ message: "Server error in get products" });
  }
});

// GET /api/products/:id → single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("Get product by id error:", err);
    res.status(500).json({ message: "Server error in get product by id" });
  }
});

// POST /api/products → naya product add (admin only)
router.post("/", auth, isAdmin, async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, stock } = req.body;

    if (!name || !price) {
      return res
        .status(400)
        .json({ message: "Name and price are required" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      imageUrl,
      category,
      stock: stock ?? 0,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: "Server error in create product" });
  }
});

// PUT /api/products/:id → update product (admin only)
router.put("/:id", auth, isAdmin, async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, stock } = req.body;

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name ?? product.name;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.imageUrl = imageUrl ?? product.imageUrl;
    product.category = category ?? product.category;
    product.stock = stock ?? product.stock;

    await product.save();

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Server error in update product" });
  }
});

// DELETE /api/products/:id → delete product (admin only)
router.delete("/:id", auth, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Server error in delete product" });
  }
});

module.exports = router;
