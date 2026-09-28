const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    console.log('🔔 Payment request received:', req.body);
    
    const { amount, currency = 'usd' } = req.body;

    // Validate amount
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ 
        success: false,
        message: 'Amount must be a valid number' 
      });
    }

    // Convert amount to cents for Stripe (smallest currency unit)
    const amountInCents = Math.round(Number(amount) * 100); 
    console.log(`💵 Amount in cents: ${amountInCents}`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency,
      automatic_payment_methods: { enabled: true },
    });

    console.log('✅ Payment intent created:', paymentIntent.id);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('❌ Stripe error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Payment processing failed',
      error: error.message,
    });
  }
});

module.exports = router;
