const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Order = require('../models/Order');
const Payment = require('../models/Payment');

/* =========================
   STRIPE WEBHOOK HANDLER
   URL: /api/stripe/webhook
========================= */
router.post('/', async (req, res) => {
  let event;

  try {
    const signature = req.headers['stripe-signature'];

    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('❌ Stripe webhook verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  /* =========================
     PAYMENT SUCCESS
  ========================= */
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;

    const orderId = intent.metadata?.orderId;

    if (!orderId) {
      console.warn('⚠️ PaymentIntent missing orderId metadata');
      return res.json({ received: true });
    }

    try {
      // Save payment record
      await Payment.create({
        orderId,
        stripePaymentIntentId: intent.id,
        amount: intent.amount_received / 100,
        currency: intent.currency,
        status: 'succeeded',
        receiptEmail: intent.receipt_email || '',
        rawStripeResponse: intent,
      });

      // Update order
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        paymentId: intent.id,
        orderStatus: 'processing',
      });

      console.log(`✅ Payment successful → Order updated: ${orderId}`);
    } catch (dbError) {
      console.error('❌ Database update failed:', dbError);
    }
  }

  res.json({ received: true });
});

module.exports = router;
