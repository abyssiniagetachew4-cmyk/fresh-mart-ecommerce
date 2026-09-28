const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const adminController = require('../controllers/adminController');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const ContactMessage = require('../models/ContactMessage');

// Dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

// Sales data for charts: daily, weekly, monthly
router.get('/sales', adminController.getSalesData);

/* =========================
   ADMIN: GET ALL PAYMENTS
========================= */
router.get('/payments', async (req, res) => {
  try {
    // Populate order info for better context
    const payments = await Payment.find()
      .populate({
        path: 'orderId',
        select: 'orderNumber userId total paymentStatus orderStatus',
        populate: { path: 'userId', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (err) {
    console.error('❌ Failed to fetch payments:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

/* =========================
   ADMIN: UPDATE ORDER STATUS (Delivery)
========================= */
router.put('/orders/:orderId/status', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID' });
  }

  try {
    const order = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, message: 'Order status updated', order });
  } catch (err) {
    console.error('❌ Failed to update order status:', err);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

/* =========================
   ADMIN: GET CONTACT MESSAGES
========================= */
router.get('/messages', async (req, res) => {
  try {
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      messages,
    });
  } catch (err) {
    console.error('❌ Failed to fetch contact messages:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages',
    });
  }
});
module.exports = router;
