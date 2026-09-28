const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const stripe = require('stripe');
const contactRoutes = require("./routes/contactRoutes");

dotenv.config();

const app = express();

/* =========================
   STRIPE WEBHOOK (RAW BODY)
   MUST BE BEFORE express.json()
========================= */
app.use(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  require('./routes/stripeWebhook')
);

/* =========================
   MIDDLEWARE
========================= */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
  })
);

// JSON parser (AFTER webhook)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   STRIPE INSTANCE
========================= */
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

/* =========================
   ROUTES
========================= */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/contact', contactRoutes);

/* =========================
   CREATE PAYMENT INTENT
========================= */
app.post('/api/payment/create-payment-intent', async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || amount <= 0 || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Amount and orderId are required',
      });
    }

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId, // 🔑 LINK TO ORDER
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('❌ Payment intent error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
    });
  }
});

/* =========================
   TEST ROUTES
========================= */
app.get('/', (req, res) => {
  res.send('Backend is running...');
});

app.get('/api/payment/test', (req, res) => {
  res.json({ message: 'Payment route is working!' });
});

/* =========================
   DATABASE
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
