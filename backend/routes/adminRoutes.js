const express = require("express");
const { User, Product, Order, sequelize } = require("../models");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

/**
 * GET /api/admin/dashboard
 * Admin stats: total users, products, orders, revenue, orders by status
 */
router.get("/dashboard", auth, isAdmin, async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      User.count(),
      Product.count(),
      Order.count(),
    ]);

    const totalRevenue = (await Order.sum("totalPrice")) || 0;

    // Orders grouped by status
    const ordersByStatusRaw = await Order.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    const ordersByStatus = ordersByStatusRaw.map((row) => ({
      status: row.status,
      count: Number(row.get("count")),
    }));

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      ordersByStatus,
    });
  } catch (err) {
    console.error("Admin dashboard stats error:", err);
    res.status(500).json({ message: "Server error in admin dashboard stats" });
  }
});

module.exports = router;
