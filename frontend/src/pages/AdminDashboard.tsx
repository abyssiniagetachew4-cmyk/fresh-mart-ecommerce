import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Edit,
  ChevronRight,
  Download as DownloadIcon,
  RefreshCw,
  ArrowUpRight,
  PackageCheck,
  Truck,
  Eye
} from 'lucide-react';
import axios from 'axios';
import { toast } from '../hooks/use-toast';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import OrderStatusBadge from '../components/OrderStatusBadge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';

// TypeScript interfaces
interface DashboardStats {
  totals: {
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
  alerts: {
    pendingOrders: number;
    lowStockCount: number;
    expiredProductsCount: number;
  };
  recentOrders: any[];
  customerActivity: {
    newCustomersToday: number;
    returningCustomers: number;
    totalCustomers: number;
    avgOrderValue: number;
    customerGrowthRate: number;
  };
  topProducts: Array<{
    _id: string;
    name: string;
    soldCount: number;
    revenue: number;
    stock: number;
    category: string;
  }>;
  salesTrends: {
    daily: any[];
    weekly: any[];
    monthly: any[];
  };
  orderStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

interface ReportMetrics {
  sales: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    growth: number;
  };
  customers: {
    totalCustomers: number;
    newCustomers: number;
    returningRate: number;
    growth: number;
  };
  inventory: {
    totalProducts: number;
    outOfStock: number;
    lowStock: number;
    totalValue: number;
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  /* ================= STATE ================= */
  const [orders, setOrders] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);

  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [reportMetrics, setReportMetrics] = useState<ReportMetrics | null>(null);

  const [reportPeriod, setReportPeriod] = useState<'today' | 'week' | 'month' | 'year'>('week');

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/auth');
    }
  }, [isAuthenticated, user, navigate]);

  /* ================= DASHBOARD ================= */
  useEffect(() => {
    setLoadingDashboard(true);
    axios
      .get('http://localhost:5000/api/admin/dashboard')
      .then(res => {
        const data = res.data.data;
        setDashboard(data);
        setRecentOrders(data?.recentOrders || []);
      })
      .catch(() =>
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive'
        })
      )
      .finally(() => setLoadingDashboard(false));
  }, []);

  /* ================= FETCH REPORT METRICS ================= */
  const fetchReportMetrics = async () => {
    setLoadingReports(true);
    try {
      // Try to fetch from report API
      const { reportAPI } = await import('@/services/api');
      const response = await reportAPI.getDashboardSummary();
      
      if (response.data) {
        const metrics: ReportMetrics = {
          sales: {
            totalRevenue: response.data.salesMetrics?.totalRevenue || 0,
            totalOrders: response.data.salesMetrics?.totalOrdersCount || 0,
            avgOrderValue: response.data.salesMetrics?.avgOrderValue || 0,
            growth: 12.5 // Mock growth
          },
          customers: {
            totalCustomers: response.data.customerMetrics?.totalCustomers || 0,
            newCustomers: response.data.customerMetrics?.acquisitionRate || 0,
            returningRate: 71.2, // Mock returning rate
            growth: 8.2
          },
          inventory: {
            totalProducts: response.data.inventoryMetrics?.totalProducts || 0,
            outOfStock: response.data.inventoryMetrics?.outOfStock || 0,
            lowStock: response.data.inventoryMetrics?.lowStock || 0,
            totalValue: response.data.inventoryMetrics?.totalInventoryValue || 0
          }
        };
        setReportMetrics(metrics);
      }
    } catch (error) {
      console.log('Using mock report metrics');
      // Fallback to mock data
      setReportMetrics({
        sales: {
          totalRevenue: 125450.75,
          totalOrders: 1245,
          avgOrderValue: 100.75,
          growth: 12.5
        },
        customers: {
          totalCustomers: 1250,
          newCustomers: 145,
          returningRate: 71.2,
          growth: 8.2
        },
        inventory: {
          totalProducts: 245,
          outOfStock: 12,
          lowStock: 35,
          totalValue: 125450.75
        }
      });
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReportMetrics();
  }, []);

  /* ================= PRODUCTS ================= */
  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:5000/api/products/admin/all');
    setProducts(res.data.products || []);
  };

  useEffect(() => {
    fetchProducts();
    axios
      .get('http://localhost:5000/api/products/admin/low-stock')
      .then(res => setLowStock(res.data.products || []))
      .catch(() => {
        // If API doesn't exist, set empty array
        setLowStock([]);
      });
  }, []);

  /* ================= ORDERS ================= */
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/orders/admin/all')
      .then(res => setOrders(res.data.orders || []))
      .finally(() => setLoadingOrders(false));
  }, []);

  /* ================= HANDLERS ================= */
  const handleExportReport = async (type: 'sales' | 'customers' | 'inventory') => {
    toast({
      title: 'Export Started',
      description: `Exporting ${type} report...`,
    });
    
    try {
      const { reportAPI } = await import('@/services/api');
      const response = await reportAPI.exportReport(type, 'csv');
      reportAPI.downloadFile(response.data, `${type}-report-${Date.now()}.csv`);
      
      toast({
        title: 'Export Complete',
        description: `${type} report downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export report',
        variant: 'destructive'
      });
    }
  };

  const handleViewOrderDetails = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  const handleRefreshReports = () => {
    fetchReportMetrics();
    toast({
      title: 'Refreshing',
      description: 'Updating report metrics...',
    });
  };

  /* ================= STATS ================= */
  const stats = [
    {
      label: 'Total Orders',
      value: dashboard?.totals?.totalOrders ?? 0,
      icon: ShoppingCart,
      change: '+12%',
      trend: 'up',
      description: 'From last month'
    },
    {
      label: 'Total Products',
      value: dashboard?.totals?.totalProducts ?? 0,
      icon: Package,
      change: '+5%',
      trend: 'up',
      description: 'Active products'
    },
    {
      label: 'Total Customers',
      value: dashboard?.totals?.totalCustomers ?? 0,
      icon: Users,
      change: '+8%',
      trend: 'up',
      description: 'Registered users'
    },
    {
      label: 'Total Revenue',
      value: `$${(dashboard?.totals?.totalRevenue ?? 0).toFixed(2)}`,
      icon: DollarSign,
      change: '+15%',
      trend: 'up',
      description: 'This month'
    },
    {
      label: 'Pending Orders',
      value: dashboard?.alerts?.pendingOrders ?? 0,
      icon: Clock,
      change: '-3%',
      trend: 'down',
      description: 'Need attention',
      variant: 'warning' as const
    },
    {
      label: 'Avg Order Value',
      value: `$${(dashboard?.customerActivity?.avgOrderValue ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      change: '+5%',
      trend: 'up',
      description: 'Customer spending'
    }
  ];

  // Show only first 10 products
  const filteredProducts = products
    .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 10); // Limit to 10 products

  if (loadingDashboard) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your grocery store performance</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={reportPeriod} onValueChange={(value: any) => setReportPeriod(value)}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => handleExportReport('sales')}>
                <Download className="w-4 h-4 mr-2" />
                Export Sales
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefreshReports}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingReports ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* ============ QUICK NAVIGATION BUTTONS ============ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer border-blue-200 hover:border-blue-300"
              onClick={() => navigate('/admin/products')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Manage Products</h3>
                    <p className="text-sm text-gray-600">View, edit, and manage all products</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer border-green-200 hover:border-green-300"
              onClick={() => navigate('/admin/orders')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Manage Orders</h3>
                    <p className="text-sm text-gray-600">Process and track customer orders</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer border-purple-200 hover:border-purple-300"
              onClick={() => navigate('/admin/customers')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Manage Customers</h3>
                    <p className="text-sm text-gray-600">View customer profiles and activity</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="hover:shadow-md transition-shadow cursor-pointer border-orange-200 hover:border-orange-300"
              onClick={() => navigate('/admin/delivery')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Delivery & Logistics</h3>
                    <p className="text-sm text-gray-600">Manage delivery zones, slots, and drivers</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ============ REPORT QUICK ACCESS CARDS ============ */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/reports')}>
                View All Reports
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sales Report Card */}
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Sales Report</h3>
                      <p className="text-sm text-gray-600">Revenue, orders, and trends</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Revenue</span>
                      <span className="font-bold">${reportMetrics?.sales.totalRevenue.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Orders</span>
                      <span className="font-bold">{reportMetrics?.sales.totalOrders.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg Order</span>
                      <span className="font-bold">${reportMetrics?.sales.avgOrderValue.toFixed(2) || '0'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="default" 
                      className="flex-1"
                      onClick={() => navigate('/admin/reports/sales')}
                    >
                      View Report
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleExportReport('sales')}
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Report Card */}
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Customer Report</h3>
                      <p className="text-sm text-gray-600">Insights and demographics</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Customers</span>
                      <span className="font-bold">{reportMetrics?.customers.totalCustomers.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">New Customers</span>
                      <span className="font-bold">{reportMetrics?.customers.newCustomers || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Returning Rate</span>
                      <span className="font-bold">{reportMetrics?.customers.returningRate.toFixed(1) || '0'}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="default" 
                      className="flex-1"
                      onClick={() => navigate('/admin/reports/customers')}
                    >
                      View Report
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleExportReport('customers')}
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory Report Card */}
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">Inventory Report</h3>
                      <p className="text-sm text-gray-600">Stock levels and expiry tracking</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <PackageCheck className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Products</span>
                      <span className="font-bold">{reportMetrics?.inventory.totalProducts || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Low Stock</span>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        {reportMetrics?.inventory.lowStock || '0'} items
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Inventory Value</span>
                      <span className="font-bold">${reportMetrics?.inventory.totalValue.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="default" 
                      className="flex-1"
                      onClick={() => navigate('/admin/reports/inventory')}
                    >
                      View Report
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleExportReport('inventory')}
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* DASHBOARD STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className={`${stat.variant === 'warning' ? 'border-yellow-200' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.variant === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'}`}>
                      <stat.icon className={`w-5 h-5 ${stat.variant === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
                    </div>
                  </div>
                  <div className="flex items-center mt-3">
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">{stat.description}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ALERTS SECTION */}
          {(dashboard?.alerts?.lowStockCount || 0) > 0 || (dashboard?.alerts?.pendingOrders || 0) > 0 ? (
            <Card className="mb-8 border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Low Stock Items</p>
                      <p className="text-sm text-gray-600">{dashboard.alerts?.lowStockCount || 0} items need restocking</p>
                    </div>
                    <Badge variant="destructive">{dashboard.alerts?.lowStockCount || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Pending Orders</p>
                      <p className="text-sm text-gray-600">Orders awaiting processing</p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      {dashboard.alerts?.pendingOrders || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* PRODUCTS & INVENTORY MANAGEMENT */}
          <Tabs defaultValue="products" className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Products
                </TabsTrigger>
                <TabsTrigger value="inventory" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Inventory Alerts
                </TabsTrigger>
                <TabsTrigger value="all-orders" className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  All Orders
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/products')}
                  className="flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  View All Products
                </Button>
              </div>
            </div>

            <TabsContent value="products">
              <Card>
                <CardContent className="pt-6">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto text-gray-300" />
                      <p className="mt-2 text-gray-500">No products found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <div className="mb-4 text-sm text-gray-600">
                        Showing {filteredProducts.length} of {products.length} products. Use search to filter or click "View All Products" to see all.
                      </div>
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 font-semibold">Product</th>
                            <th className="text-left py-3 font-semibold">Category</th>
                            <th className="text-left py-3 font-semibold">Price</th>
                            <th className="text-left py-3 font-semibold">Stock</th>
                            <th className="text-left py-3 font-semibold">Status</th>
                            <th className="text-left py-3 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProducts.map((product) => (
                            <tr key={product._id} className="border-b hover:bg-gray-50">
                              <td className="py-3">
                                <div className="flex items-center gap-3">
                                  {product.images?.[0] && (
                                    <img
                                      src={product.images[0]}
                                      alt={product.name}
                                      className="w-10 h-10 rounded object-cover"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.SKU}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3">
                                <Badge variant="outline">{product.category?.name || 'Uncategorized'}</Badge>
                              </td>
                              <td className="py-3 font-semibold">${product.price?.toFixed(2)}</td>
                              <td className="py-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${product.stock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="py-3">
                                <Badge variant={product.isActive ? "default" : "secondary"}>
                                  {product.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="py-3">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                  >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => navigate(`/products/${product._id}`)}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Management</CardTitle>
                  <CardDescription>Monitor stock levels and product status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Low Stock Items */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        Low Stock Items ({lowStock.length})
                      </h3>
                      <div className="space-y-2">
                        {lowStock.slice(0, 8).map((product) => (
                          <div key={product._id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-gray-500">Current stock: {product.stock}</p>
                            </div>
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              Restock
                            </Badge>
                          </div>
                        ))}
                        {lowStock.length === 0 && (
                          <p className="text-gray-500 p-3">No low stock items</p>
                        )}
                      </div>
                    </div>

                    {/* Stock Status Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold">{products.filter(p => p.stock > 20).length}</p>
                        <p className="text-sm text-gray-600">Good Stock</p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold">{products.filter(p => p.stock <= 20 && p.stock > 5).length}</p>
                        <p className="text-sm text-gray-600">Medium Stock</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold">{products.filter(p => p.stock <= 5 && p.stock > 0).length}</p>
                        <p className="text-sm text-gray-600">Low Stock</p>
                      </div>
                      <div className="bg-gray-100 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold">{products.filter(p => p.stock === 0).length}</p>
                        <p className="text-sm text-gray-600">Out of Stock</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all-orders">
              <Card>
                <CardContent className="pt-6">
                  {loadingOrders ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 mx-auto text-gray-300" />
                      <p className="mt-2 text-gray-500">No orders found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 font-semibold">Order #</th>
                            <th className="text-left py-3 font-semibold">Customer</th>
                            <th className="text-left py-3 font-semibold">Date</th>
                            <th className="text-left py-3 font-semibold">Total</th>
                            <th className="text-left py-3 font-semibold">Status</th>
                            <th className="text-left py-3 font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr key={order._id} className="border-b hover:bg-gray-50">
                              <td className="py-3 font-medium">#{order.orderNumber}</td>
                              <td className="py-3">{order.user?.name || 'Guest'}</td>
                              <td className="py-3 text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 font-semibold">${order.total?.toFixed(2)}</td>
                              <td className="py-3">
                                <OrderStatusBadge status={order.orderStatus} />
                              </td>
                              <td className="py-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewOrderDetails(order._id)}
                                >
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;