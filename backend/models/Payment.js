const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: 'usd',
    },

    paymentMethod: {
      type: String,
      default: 'stripe',
    },

    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed'],
      default: 'pending',
    },

    receiptEmail: String,

    rawStripeResponse: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
