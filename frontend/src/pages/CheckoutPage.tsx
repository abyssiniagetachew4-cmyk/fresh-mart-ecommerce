/**
 * Checkout Page with Stripe Payment Integration (FIXED & SAFE)
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from '@/components/StripePaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe'>('cod');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const deliveryFee = totalAmount >= 50 ? 0 : 5;
  const tax = totalAmount * 0.1;
  const finalTotal = totalAmount + deliveryFee + tax;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  useEffect(() => {
  if (!isAuthenticated) {
    navigate('/auth', {
  replace: true,
  state: { from: '/checkout' },
});
  }
}, [isAuthenticated, navigate]);

  useEffect(() => {
  if (isAuthenticated && items.length === 0 && !orderPlaced) {
    navigate('/cart', { replace: true });
  }
}, [isAuthenticated, items.length, orderPlaced, navigate]);

  // ===== CREATE ORDER =====
  const createOrder = async () => {
    const orderItems = items.map((item) => ({
      productId: item.product._id,
      name: item.product.name,
      price: Number(item.product.price),
      quantity: Number(item.quantity),
      image: item.product.image || '',
    }));

    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user?._id || user?.id,
        items: orderItems,
        subtotal: totalAmount,
        deliveryFee,
        tax,
        total: finalTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'stripe' ? 'pending' : 'pending',
        orderStatus: 'pending',
        shippingAddress: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to create order');
    }

    const data = await response.json();
    setOrderId(data.order._id);
    return data.order;
  };

  // ===== STRIPE PAYMENT =====
  const startStripePayment = async () => {
    try {
      setLoading(true);
      const order = await createOrder();

      const res = await fetch('http://localhost:5000/api/payment/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          orderId: order._id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create payment intent');
      }

      const data = await res.json();
      setClientSecret(data.clientSecret);
    } catch (err: any) {
      toast({
        title: 'Checkout Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== PAYMENT SUCCESS HANDLER =====
  const onPaymentSuccess = () => {
    clearCart();
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Confirmed</h1>
            <p className="text-muted-foreground mb-6">
              Payment successful. Thank you!
            </p>
            <Link to="/dashboard">
              <Button>View Orders</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 container mx-auto px-4">
        <Link to="/cart" className="flex items-center gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT */}
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Delivery Info</h2>

              {Object.keys(formData).map((key) => (
                <div key={key} className="mb-3">
                  <Label>{key}</Label>
                  <Input
                    value={(formData as any)[key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>

            <div className="bg-card p-6 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Payment</h2>

              <RadioGroup
                value={paymentMethod}
                onValueChange={(v: 'cod' | 'stripe') => setPaymentMethod(v)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <RadioGroupItem value="cod" /> Cash on Delivery
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="stripe" /> Card (Stripe)
                </div>
              </RadioGroup>

              {paymentMethod === 'stripe' && (
                <>
                  {!clientSecret ? (
                    <Button
                      onClick={startStripePayment}
                      disabled={loading}
                      className="mt-4 w-full"
                    >
                      Pay with Card
                    </Button>
                  ) : (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripePaymentForm
                        amount={finalTotal}
                        onSuccess={onPaymentSuccess}
                      />
                    </Elements>
                  )}
                </>
              )}

              {paymentMethod === 'cod' && (
                <Button
                  onClick={async () => {
                    await createOrder();
                    clearCart();
                    setOrderPlaced(true);
                  }}
                  className="mt-4 w-full"
                >
                  Place Order
                </Button>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-card p-6 rounded-xl h-fit">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <p>Total: ${finalTotal.toFixed(2)}</p>
            <p>Delivery: ${deliveryFee.toFixed(2)}</p>
            <p>Tax: ${tax.toFixed(2)}</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
