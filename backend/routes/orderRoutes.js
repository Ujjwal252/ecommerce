const express = require("express");
const { Order, OrderItem, Product, User, sequelize } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * POST /api/orders
 * Body:
 * {
 *   "items": [
 *     { "productId": 1, "quantity": 2 },
 *     { "productId": 2, "quantity": 1 }
 *   ]
 * }
 */
router.post("/", auth, async (req, res) => {
  console.log("🔥 POST /api/orders route handler invoked");
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { items } = req.body;

    // validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Items array is required and cannot be empty" });
    }

    const productIds = items.map((it) => it.productId);

    // saare products fetch karo
    const products = await Product.findAll({
      where: { id: productIds },
      transaction: t,
    });

    if (products.length !== productIds.length) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "One or more products not found" });
    }

    let totalAmount = 0;

    const orderItemsData = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const price = product.price;

      totalAmount += price * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price,
      };
    });

    // order create
    const order = await Order.create(
      {
        userId,
        totalPrice: totalAmount,
        status: "PENDING",
      },
      { transaction: t }
    );

    // order items create
    const orderItemsWithOrderId = orderItemsData.map((it) => ({
      ...it,
      orderId: order.id,
    }));

    await OrderItem.bulkCreate(orderItemsWithOrderId, { transaction: t });

    await t.commit();

    return res.status(201).json({
      message: "Order created successfully",
      orderId: order.id,
      totalAmount,
    });
  } catch (err) {
    console.error("Create order error:", err);
    await t.rollback();
    return res.status(500).json({ message: "Server error in create order" });
  }
});

/**
 * GET /api/orders/my
 * current user ke orders
 */
router.get("/my", auth, async (req, res) => {
  console.log("🔥 GET /api/orders/my route handler invoked");

  try {
    const userId = req.user.id;

    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(orders);
  } catch (err) {
    console.error("Get my orders error:", err);
    return res.status(500).json({ message: "Server error in get my orders" });
  }
});

/**
 * GET /api/orders
 * All orders (admin only)
 */
router.get("/", auth, async (req, res) => {
  console.log("🔥 GET /api/orders (admin) route handler invoked");

  try {
    // simple admin check: assume req.user.isAdmin flag hai
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access only" });
    }

    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "price"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json(orders);
  } catch (err) {
    console.error("Get all orders (admin) error:", err);
    return res
      .status(500)
      .json({ message: "Server error in get all orders" });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Body: { status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED" }
 * Admin only
 */
router.patch("/:id/status", auth, async (req, res) => {
  console.log("🔥 PATCH /api/orders/:id/status invoked");
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access only" });
    }

    const orderId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "PAID",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    return res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Update order status error:", err);
    return res
      .status(500)
      .json({ message: "Server error in update order status" });
  }
});

module.exports = router;
