/**
 * User Dashboard - Orders & Profile
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, User, LogOut, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) navigate('/auth');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?._id && !user?.id) {
        console.error('No user ID found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        // Get the user ID (try _id first, then id)
        const userId = user?._id || user?.id;
        console.log('📋 Fetching orders for user ID:', userId);
        
        const response = await fetch(`http://localhost:5000/api/orders/user/${userId}`);
        console.log('📋 Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Error fetching orders:', errorText);
          throw new Error(`Failed to fetch orders: ${errorText}`);
        }

        const data = await response.json();
        console.log('📋 Orders data received:', data);
        
        if (data.success && data.orders) {
          setOrders(data.orders);
        } else {
          console.error('❌ Invalid response format:', data);
          setError('Invalid response from server');
        }
      } catch (err) {
        console.error('❌ Error in fetchOrders:', err);
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl p-6 shadow-soft">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="font-semibold">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <nav className="space-y-2">
                  <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary/10 text-primary">
                    <Package className="w-5 h-5" /> My Orders
                  </Link>
                  <button onClick={logout} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary w-full text-left text-destructive">
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </nav>
              </div>
            </div>

            {/* Orders */}
            <div className="lg:col-span-3">
              <h1 className="font-display text-2xl font-bold mb-6">My Orders</h1>
              
              {loading ? (
                <div className="bg-card rounded-2xl p-12 text-center shadow-soft">
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading your orders...</p>
                </div>
              ) : error ? (
                <div className="bg-card rounded-2xl p-6 shadow-soft">
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                  <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-card rounded-2xl p-12 text-center shadow-soft">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                  <p className="text-muted-foreground mb-6">Start shopping to see your orders here!</p>
                  <Link to="/products"><Button>Browse Products</Button></Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="bg-card rounded-2xl p-6 shadow-soft">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Order #{order.orderNumber || order._id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <OrderStatusBadge status={order.orderStatus} />
                          <span className={`text-xs px-2 py-1 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-12 h-12 rounded-lg object-cover" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x48?text=Product';
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                                <span className="ml-2 font-medium">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-border pt-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-muted-foreground">Delivery</span>
                          <span>{order.deliveryFee === 0 ? 'Free' : `$${order.deliveryFee.toFixed(2)}`}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-muted-foreground">Tax</span>
                          <span>${order.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                          <span>Total</span>
                          <span className="text-primary">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground mb-1">Shipping to:</p>
                        <p className="text-sm">
                          {order.shippingAddress.name}<br />
                          {order.shippingAddress.address}<br />
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                          {order.shippingAddress.country}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;