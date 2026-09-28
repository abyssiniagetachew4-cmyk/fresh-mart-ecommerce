// routes/orderRoute.js

const express = require('express');
const router = express.Router();

// Controllers
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');

/* =========================
   CUSTOMER ROUTES
========================= */

// Create a new order
router.post('/', createOrder);

// Get all orders of a specific user
router.get('/user/:userId', getUserOrders);

// Get a single order by ID
router.get('/:id', getOrderById);

/* =========================
   ADMIN ROUTES
========================= */

// Get all orders with optional filters
router.get('/admin/all', getAllOrders);

// Update order status
router.put('/:orderId/status', updateOrderStatus);

// Add this at the top of orderRoute.js, after the imports
router.get('/test', (req, res) => {
  console.log('✅ Test route hit!');
  res.json({ success: true, message: 'Backend is working' });
});

module.exports = router;
