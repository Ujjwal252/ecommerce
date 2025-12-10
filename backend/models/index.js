const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

const db = {};

db.sequelize = sequelize;
db.Sequelize = require('sequelize');

// Models import
db.User = require('./user')(sequelize, DataTypes);
db.Product = require('./product')(sequelize, DataTypes);
db.Order = require('./order')(sequelize, DataTypes);
db.OrderItem = require('./orderItem')(sequelize, DataTypes);

// Relations

// 1 User hasMany Orders
db.User.hasMany(db.Order, { foreignKey: 'userId', as: 'orders' });
db.Order.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// 1 Order hasMany OrderItems
db.Order.hasMany(db.OrderItem, { foreignKey: 'orderId', as: 'items' });
db.OrderItem.belongsTo(db.Order, { foreignKey: 'orderId', as: 'order' });

// 1 Product hasMany OrderItems
db.Product.hasMany(db.OrderItem, { foreignKey: 'productId', as: 'orderItems' });
db.OrderItem.belongsTo(db.Product, { foreignKey: 'productId', as: 'product' });

module.exports = db;
