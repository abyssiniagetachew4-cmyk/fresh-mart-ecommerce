import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const createPaymentIntent = async (amount) => {
  try {
    const response = await axios.post(`${API_URL}/payment/create-payment-intent`, {
      amount,
      currency: 'usd'
    });
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};