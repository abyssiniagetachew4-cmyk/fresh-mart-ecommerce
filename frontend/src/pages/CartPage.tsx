/**
 * Cart Page – Prices in Ethiopian Birr (₨)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartItem from '@/components/CartItem';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const DELIVERY_THRESHOLD = 50; // in ETB
const DELIVERY_FEE = 5; // in ETB

const CartPage: React.FC = () => {
  const { items, totalAmount, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">Add some products to get started!</p>
            <Link to="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate delivery and total
  const deliveryFee = totalAmount >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const totalWithDelivery = totalAmount + deliveryFee;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                {items.map(item => (
                  <CartItem key={item.product._id} item={item} />
                ))}
                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="ghost" onClick={clearCart} className="text-destructive">
                    Clear Cart
                  </Button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-card rounded-2xl p-6 shadow-soft sticky top-24">
                <h2 className="font-display text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>ETB {totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{deliveryFee === 0 ? 'Free' : `ETB ${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">ETB {totalWithDelivery.toFixed(2)}</span>
                  </div>
                </div>
                <Link to="/checkout">
                  <Button className="w-full" size="lg">
                    Checkout <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Free delivery on orders over ETB {DELIVERY_THRESHOLD}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CartPage;
