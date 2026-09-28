const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

/* =========================
   CREATE ORDER (Customer)
========================= */
exports.createOrder = asyncHandler(async (req, res) => {
  console.log('🔍 CREATE ORDER REQUEST');
  console.log(req.body);

  let {
    userId,
    items,
    paymentMethod = 'cod',
    shippingAddress,
    paymentIntentId, // 🔑 Stripe sends this later
  } = req.body;

  if (!items || items.length === 0 || !shippingAddress) {
    return res.status(400).json({
      success: false,
      message: 'Missing required order information',
    });
  }

  // Guest or logged in
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    userId = new mongoose.Types.ObjectId(userId);
  } else {
    userId = null;
  }

  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found: ${item.productId}`,
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock for ${product.name}`,
      });
    }

    item.price = product.price;
    item.name = product.name;
    item.image = product.image || '';

    subtotal += product.price * item.quantity;
  }

  const deliveryFee = subtotal >= 50 ? 0 : 5;
  const tax = subtotal * 0.1;
  const total = subtotal + deliveryFee + tax;

  const order = new Order({
    userId,
    items,
    subtotal,
    tax,
    deliveryFee,
    total,
    paymentMethod,
    paymentStatus: paymentMethod === 'stripe' ? 'pending' : 'pending',
    paymentIntentId: paymentMethod === 'stripe' ? paymentIntentId || '' : '',
    orderStatus: 'pending',
    shippingAddress,
  });

  await order.save();

  // Reduce stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Order created',
    order,
  });
});

/* =========================
   STRIPE: MARK ORDER PAID
========================= */
exports.markOrderPaid = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;

  if (!paymentIntentId) {
    return res.status(400).json({
      success: false,
      message: 'paymentIntentId is required',
    });
  }

  const order = await Order.findOne({ paymentIntentId });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found for this payment',
    });
  }

  order.paymentStatus = 'paid';
  order.paidAt = new Date();
  order.orderStatus = 'processing';

  await order.save();

  res.json({
    success: true,
    message: 'Order marked as paid',
    order,
  });
});

/* =========================
   GET USER ORDERS
========================= */
exports.getUserOrders = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  const orders = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .populate('items.productId', 'name image price');

  res.json({ success: true, orders });
});

/* =========================
   GET SINGLE ORDER
========================= */
exports.getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID' });
  }

  const order = await Order.findById(id).populate(
    'items.productId',
    'name image price'
  );

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, order });
});

/* =========================
   ADMIN: GET ALL ORDERS
========================= */
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, orders });
});

/* =========================
   ADMIN: UPDATE ORDER STATUS
========================= */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus: status },
    { new: true }
  );

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, order });
});
