require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const healthRoute = require('./routes/healthRoute');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.post("/api/orders/test", (req, res) => {
  res.json({ message: "Direct /api/orders/test working" });
});

// Test route
app.use('/api/health', healthRoute);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use("/api/admin", adminRoutes);
app.use(
  "/api/orders",
  (req, res, next) => {
    console.log("👉 /api/orders base hit:", req.method, req.url);
    next();
  },
  orderRoutes
);


const PORT = process.env.PORT || 5000;

db.sequelize.authenticate()
  .then(() => {
    console.log("✅ MySQL Database Connected");
    return db.sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });
