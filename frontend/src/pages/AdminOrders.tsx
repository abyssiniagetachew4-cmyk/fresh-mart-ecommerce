// File: /pages/AdminOrders.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Download,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  MoreVertical,
  Printer,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';

/* ================= TYPES ================= */

interface OrderItem {
  productId: string;
  name?: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  user?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliverySlot?: {
    date: string;
    time: string;
  };
  createdAt: string;
}

/* ================= COMPONENT ================= */

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  /* ================= AUTH GUARD ================= */

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/auth');
    }
  }, [isAuthenticated, user, navigate]);

  /* ================= FETCH ================= */

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/orders/admin/all');
      setOrders(res.data.orders || []);
      setFilteredOrders(res.data.orders || []);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTERING (FIXED) ================= */

  useEffect(() => {
    let filtered = [...orders];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(term) ||
        o.user?.name?.toLowerCase().includes(term) ||
        o.user?.email?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.orderStatus === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(o => o.paymentStatus === paymentFilter);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  /* ================= STATUS UPDATE ================= */

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/admin/${orderId}/status`, { status });
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? { ...o, orderStatus: status } : o))
      );
      toast({ title: 'Success', description: 'Order status updated' });
      setIsStatusDialogOpen(false);
      setNewStatus('');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
    }
  };

  /* ================= EXPORT CSV (FIXED) ================= */

  const handleExportOrders = () => {
    const csv =
      'Order #,Customer,Email,Total,Status,Payment,Date\n' +
      filteredOrders
        .map(o =>
          `"${o.orderNumber}","${o.user?.name || 'Guest'}","${o.user?.email || ''}",${o.total},"${o.orderStatus}","${o.paymentStatus}","${format(
            new Date(o.createdAt),
            'yyyy-MM-dd'
          )}"`
        )
        .join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(`data:text/csv;charset=utf-8,${csv}`);
    link.download = 'orders.csv';
    link.click();
  };

  /* ================= PAGINATION ================= */

  const start = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between mb-6">
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportOrders}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button variant="outline" onClick={fetchOrders}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentOrders.map(order => (
                  <TableRow key={order._id}>
                    <TableCell>#{order.orderNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{order.user?.name || 'Guest User'}</span>
                        <span className="text-xs text-gray-500">
                          {order.user?.email || 'No email'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge>{order.orderStatus}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailsDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AdminOrders;
