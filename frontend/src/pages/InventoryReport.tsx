import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowLeft,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Warehouse,
  Truck,
  Box,
  Tag,
  Layers,
  BarChart,
  LineChart,
  CalendarDays
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';

interface InventoryReportData {
  metrics: {
    totalProducts: number;
    totalValue: number;
    outOfStock: number;
    lowStock: number;
    inStock: number;
    avgStockLevel: number;
    turnoverRate: number;
  };
  stockReport: {
    products: Array<{
      _id: string;
      name: string;
      sku: string;
      category: string;
      stockQuantity: number;
      minStockLevel: number;
      price: number;
      costPrice: number;
      value: number;
      status: 'in_stock' | 'low_stock' | 'out_of_stock';
    }>;
    categories: Array<{
      name: string;
      productCount: number;
      totalValue: number;
      lowStockCount: number;
    }>;
  };
  expiryReport: {
    expiringProducts: Array<{
      _id: string;
      name: string;
      expiryDate: string;
      daysUntilExpiry: number;
      stockQuantity: number;
      value: number;
      status: 'expired' | 'expiring_soon' | 'safe';
    }>;
    summary: {
      expired: number;
      expiringThisWeek: number;
      expiringThisMonth: number;
      totalAtRiskValue: number;
    };
  };
  movementReport: {
    fastMoving: Array<{
      _id: string;
      name: string;
      salesCount: number;
      stockQuantity: number;
      turnoverRate: number;
    }>;
    slowMoving: Array<{
      _id: string;
      name: string;
      salesCount: number;
      stockQuantity: number;
      turnoverRate: number;
    }>;
    summary: {
      avgTurnoverRate: number;
      topMovingCount: number;
      slowMovingCount: number;
    };
  };
}

const InventoryReport: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  /* ================= STATE ================= */
  const [reportData, setReportData] = useState<InventoryReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Filters
  const [reportType, setReportType] = useState<'stock' | 'expiry' | 'movement' | 'summary'>('summary');
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [sortBy, setSortBy] = useState('quantity');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/auth');
    }
  }, [isAuthenticated, user, navigate]);

  /* ================= FETCH REPORT DATA ================= */
  useEffect(() => {
    fetchReportData();
  }, [reportType, lowStockThreshold]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Using the reportAPI service
      const { reportAPI } = await import('@/services/api');
      
      const params = {
        reportType,
        lowStockThreshold,
        category: categoryFilter !== 'all' ? categoryFilter : undefined
      };

      const response = await reportAPI.getInventoryReport(params);
      setReportData(response.data);

    } catch (error) {
      console.error('Error fetching inventory report:', error);
      
      // Fallback to mock data
      const mockReportData: InventoryReportData = {
        metrics: {
          totalProducts: 245,
          totalValue: 125450.75,
          outOfStock: 12,
          lowStock: 35,
          inStock: 198,
          avgStockLevel: 48.5,
          turnoverRate: 3.2
        },
        stockReport: {
          products: [
            { _id: '1', name: 'Organic Apples', sku: 'PROD001', category: 'Fruits', stockQuantity: 45, minStockLevel: 20, price: 5.00, costPrice: 3.50, value: 157.50, status: 'in_stock' },
            { _id: '2', name: 'Fresh Milk', sku: 'PROD002', category: 'Dairy', stockQuantity: 8, minStockLevel: 15, price: 4.00, costPrice: 2.50, value: 20.00, status: 'low_stock' },
            { _id: '3', name: 'Whole Wheat Bread', sku: 'PROD003', category: 'Bakery', stockQuantity: 0, minStockLevel: 10, price: 3.00, costPrice: 1.80, value: 0, status: 'out_of_stock' },
            { _id: '4', name: 'Bananas', sku: 'PROD004', category: 'Fruits', stockQuantity: 25, minStockLevel: 15, price: 2.50, costPrice: 1.50, value: 37.50, status: 'in_stock' },
            { _id: '5', name: 'Eggs', sku: 'PROD005', category: 'Dairy', stockQuantity: 15, minStockLevel: 12, price: 6.00, costPrice: 4.00, value: 60.00, status: 'in_stock' },
            { _id: '6', name: 'Orange Juice', sku: 'PROD006', category: 'Beverages', stockQuantity: 5, minStockLevel: 10, price: 4.50, costPrice: 3.00, value: 15.00, status: 'low_stock' },
            { _id: '7', name: 'Cheddar Cheese', sku: 'PROD007', category: 'Dairy', stockQuantity: 30, minStockLevel: 8, price: 8.00, costPrice: 5.00, value: 150.00, status: 'in_stock' },
            { _id: '8', name: 'Whole Chicken', sku: 'PROD008', category: 'Meat', stockQuantity: 0, minStockLevel: 5, price: 12.00, costPrice: 8.00, value: 0, status: 'out_of_stock' },
            { _id: '9', name: 'Tomatoes', sku: 'PROD009', category: 'Vegetables', stockQuantity: 18, minStockLevel: 10, price: 3.50, costPrice: 2.00, value: 36.00, status: 'in_stock' },
            { _id: '10', name: 'Potatoes', sku: 'PROD010', category: 'Vegetables', stockQuantity: 7, minStockLevel: 15, price: 2.00, costPrice: 1.00, value: 7.00, status: 'low_stock' }
          ],
          categories: [
            { name: 'Fruits', productCount: 45, totalValue: 12500, lowStockCount: 5 },
            { name: 'Vegetables', productCount: 38, totalValue: 8500, lowStockCount: 8 },
            { name: 'Dairy', productCount: 32, totalValue: 15600, lowStockCount: 12 },
            { name: 'Bakery', productCount: 28, totalValue: 6800, lowStockCount: 3 },
            { name: 'Meat', productCount: 25, totalValue: 24500, lowStockCount: 6 },
            { name: 'Beverages', productCount: 30, totalValue: 9200, lowStockCount: 7 },
            { name: 'Snacks', productCount: 47, totalValue: 15600, lowStockCount: 9 }
          ]
        },
        expiryReport: {
          expiringProducts: [
            { _id: '1', name: 'Fresh Milk', expiryDate: '2024-03-25', daysUntilExpiry: 2, stockQuantity: 8, value: 20.00, status: 'expiring_soon' },
            { _id: '2', name: 'Yogurt', expiryDate: '2024-03-20', daysUntilExpiry: -3, stockQuantity: 12, value: 30.00, status: 'expired' },
            { _id: '3', name: 'Sour Cream', expiryDate: '2024-03-28', daysUntilExpiry: 5, stockQuantity: 6, value: 18.00, status: 'expiring_soon' },
            { _id: '4', name: 'Cottage Cheese', expiryDate: '2024-04-05', daysUntilExpiry: 13, stockQuantity: 10, value: 35.00, status: 'safe' },
            { _id: '5', name: 'Butter', expiryDate: '2024-04-10', daysUntilExpiry: 18, stockQuantity: 15, value: 45.00, status: 'safe' }
          ],
          summary: {
            expired: 12,
            expiringThisWeek: 25,
            expiringThisMonth: 45,
            totalAtRiskValue: 1250.75
          }
        },
        movementReport: {
          fastMoving: [
            { _id: '1', name: 'Organic Apples', salesCount: 450, stockQuantity: 45, turnoverRate: 10.0 },
            { _id: '2', name: 'Fresh Milk', salesCount: 380, stockQuantity: 8, turnoverRate: 47.5 },
            { _id: '3', name: 'Eggs', salesCount: 320, stockQuantity: 15, turnoverRate: 21.3 },
            { _id: '4', name: 'Bread', salesCount: 280, stockQuantity: 25, turnoverRate: 11.2 },
            { _id: '5', name: 'Bananas', salesCount: 250, stockQuantity: 25, turnoverRate: 10.0 }
          ],
          slowMoving: [
            { _id: '6', name: 'Specialty Cheese', salesCount: 8, stockQuantity: 45, turnoverRate: 0.18 },
            { _id: '7', name: 'Organic Quinoa', salesCount: 12, stockQuantity: 60, turnoverRate: 0.2 },
            { _id: '8', name: 'Gourmet Coffee', salesCount: 15, stockQuantity: 50, turnoverRate: 0.3 },
            { _id: '9', name: 'Artisanal Honey', salesCount: 10, stockQuantity: 40, turnoverRate: 0.25 },
            { _id: '10', name: 'Imported Olive Oil', salesCount: 18, stockQuantity: 55, turnoverRate: 0.33 }
          ],
          summary: {
            avgTurnoverRate: 3.2,
            topMovingCount: 25,
            slowMovingCount: 35
          }
        }
      };

      setReportData(mockReportData);
      
      toast({
        title: 'Using Demo Data',
        description: 'Backend not available. Showing demo inventory data.',
        variant: 'default'
      });

    } finally {
      setLoading(false);
    }
  };

  /* ================= EXPORT FUNCTIONS ================= */
  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    setExporting(true);
    try {
      const { reportAPI } = await import('@/services/api');
      
      const params = {
        reportType,
        lowStockThreshold,
        category: categoryFilter !== 'all' ? categoryFilter : undefined
      };

      toast({
        title: 'Export Started',
        description: `Exporting inventory report as ${format.toUpperCase()}...`
      });

      const response = await reportAPI.exportReport('inventory', format, params);
      reportAPI.downloadFile(response.data, `inventory-report-${Date.now()}.${format}`);

      toast({
        title: 'Export Complete',
        description: `Inventory report exported as ${format.toUpperCase()}`
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export report. Please make sure backend is running.',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  /* ================= HELPER FUNCTIONS ================= */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-500';
      case 'low_stock': return 'bg-yellow-500';
      case 'out_of_stock': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStockStatusText = (status: string) => {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  const getExpiryStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-500';
      case 'expiring_soon': return 'bg-yellow-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getExpiryStatusText = (status: string) => {
    switch (status) {
      case 'safe': return 'Safe';
      case 'expiring_soon': return 'Expiring Soon';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  };

  // Calculate pagination
  const getCurrentProducts = () => {
    if (!reportData?.stockReport?.products) return [];
    
    let products = [...reportData.stockReport.products];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      products = products.filter(product => product.category === categoryFilter);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'quantity':
        products.sort((a, b) => b.stockQuantity - a.stockQuantity);
        break;
      case 'value':
        products.sort((a, b) => b.value - a.value);
        break;
      case 'name':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'status':
        const statusOrder = { 'out_of_stock': 0, 'low_stock': 1, 'in_stock': 2 };
        products.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
        break;
    }
    
    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    return products.slice(startIndex, startIndex + itemsPerPage);
  };

  const totalPages = Math.ceil(
    (reportData?.stockReport?.products?.filter(p => 
      categoryFilter === 'all' || p.category === categoryFilter
    ).length || 0) / itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading inventory analytics...</p>
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
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory Analytics</h1>
                <p className="text-gray-600 mt-1">
                  Stock levels, expiry tracking, and inventory performance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={fetchReportData} variant="outline" disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="stock">Stock Levels</SelectItem>
                  <SelectItem value="expiry">Expiry Tracking</SelectItem>
                  <SelectItem value="movement">Stock Movement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* KEY METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{formatNumber(reportData?.metrics.totalProducts || 0)}</p>
                    <p className="text-sm text-gray-600">Total Products</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+5.2% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(reportData?.metrics.totalValue || 0)}</p>
                    <p className="text-sm text-gray-600">Total Inventory Value</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <div className="mt-2">
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">75% of target value</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{formatNumber(reportData?.metrics.outOfStock || 0)}</p>
                    <p className="text-sm text-gray-600">Out of Stock</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div className="mt-2">
                  <Badge variant="destructive" className="mt-1">
                    {((reportData?.metrics.outOfStock || 0) / (reportData?.metrics.totalProducts || 1) * 100).toFixed(1)}% of products
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{reportData?.metrics.turnoverRate.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Avg Turnover Rate</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">-0.3 from last period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FILTERS */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Report Filters
              </CardTitle>
              <CardDescription>Customize your inventory analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Low Stock Threshold</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
                      className="w-24"
                      min="1"
                    />
                    <span className="text-sm text-gray-600">units</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Fruits">Fruits</SelectItem>
                      <SelectItem value="Vegetables">Vegetables</SelectItem>
                      <SelectItem value="Dairy">Dairy</SelectItem>
                      <SelectItem value="Bakery">Bakery</SelectItem>
                      <SelectItem value="Meat">Meat</SelectItem>
                      <SelectItem value="Beverages">Beverages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quantity">Stock Quantity</SelectItem>
                      <SelectItem value="value">Inventory Value</SelectItem>
                      <SelectItem value="name">Product Name</SelectItem>
                      <SelectItem value="status">Stock Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MAIN CONTENT */}
          <Tabs defaultValue="summary" value={reportType} onValueChange={(value: any) => setReportType(value)}>
            <TabsList className="mb-6">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex items-center gap-2">
                <Warehouse className="w-4 h-4" />
                Stock Levels
              </TabsTrigger>
              <TabsTrigger value="expiry" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Expiry Tracking
              </TabsTrigger>
              <TabsTrigger value="movement" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Stock Movement
              </TabsTrigger>
            </TabsList>

            {/* SUMMARY TAB */}
            <TabsContent value="summary" className="space-y-6">
              {/* STOCK STATUS OVERVIEW */}
              <Card>
                <CardHeader>
                  <CardTitle>Stock Status Overview</CardTitle>
                  <CardDescription>Distribution of products by stock status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="font-medium">In Stock</span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{reportData?.metrics.inStock}</p>
                          <p className="text-sm text-gray-600">
                            {((reportData?.metrics.inStock || 0) / (reportData?.metrics.totalProducts || 1) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <Progress value={(reportData?.metrics.inStock || 0) / (reportData?.metrics.totalProducts || 1) * 100} className="h-2" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="font-medium">Low Stock</span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{reportData?.metrics.lowStock}</p>
                          <p className="text-sm text-gray-600">
                            {((reportData?.metrics.lowStock || 0) / (reportData?.metrics.totalProducts || 1) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <Progress value={(reportData?.metrics.lowStock || 0) / (reportData?.metrics.totalProducts || 1) * 100} className="h-2" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="font-medium">Out of Stock</span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{reportData?.metrics.outOfStock}</p>
                          <p className="text-sm text-gray-600">
                            {((reportData?.metrics.outOfStock || 0) / (reportData?.metrics.totalProducts || 1) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <Progress value={(reportData?.metrics.outOfStock || 0) / (reportData?.metrics.totalProducts || 1) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CATEGORY PERFORMANCE */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Inventory value and stock status by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Total Value</TableHead>
                        <TableHead>Low Stock Items</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData?.stockReport.categories.map((category) => (
                        <TableRow key={category.name}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell>{formatNumber(category.productCount)}</TableCell>
                          <TableCell>{formatCurrency(category.totalValue)}</TableCell>
                          <TableCell>
                            <Badge variant={category.lowStockCount > 5 ? "destructive" : "outline"}>
                              {category.lowStockCount} items
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                category.lowStockCount > 10 ? 'bg-red-500' :
                                category.lowStockCount > 5 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`} />
                              <span className="text-sm">
                                {category.lowStockCount > 10 ? 'Critical' :
                                 category.lowStockCount > 5 ? 'Warning' :
                                 'Healthy'}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* STOCK LEVELS TAB */}
            <TabsContent value="stock" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Stock Levels</CardTitle>
                  <CardDescription>Detailed view of all products and their stock status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Stock Level</TableHead>
                          <TableHead>Min Stock</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getCurrentProducts().map((product) => (
                          <TableRow key={product._id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="text-sm text-gray-500">{product.sku}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{product.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{product.stockQuantity}</span>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      product.stockQuantity === 0 ? 'bg-red-500' :
                                      product.stockQuantity <= product.minStockLevel ? 'bg-yellow-500' :
                                      'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(100, (product.stockQuantity / (product.minStockLevel * 3)) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{product.minStockLevel}</TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(product.value)}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${
                                product.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                                product.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {getStockStatusText(product.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => navigate(`/admin/products/${product._id}/edit`)}>
                                Reorder
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* PAGINATION */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, reportData?.stockReport.products.length || 0)} of {reportData?.stockReport.products.length} products
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* EXPIRY TRACKING TAB */}
            <TabsContent value="expiry" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Expiry Risk Summary</CardTitle>
                  <CardDescription>Products approaching or past expiry date</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-red-600">{reportData?.expiryReport.summary.expired}</p>
                          <p className="text-gray-600">Expired Products</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Value: {formatCurrency(reportData?.expiryReport.summary.totalAtRiskValue || 0)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-yellow-600">{reportData?.expiryReport.summary.expiringThisWeek}</p>
                          <p className="text-gray-600">Expiring This Week</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Requires immediate attention
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-orange-600">{reportData?.expiryReport.summary.expiringThisMonth}</p>
                          <p className="text-gray-600">Expiring This Month</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Monitor closely
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Days Until Expiry</TableHead>
                        <TableHead>Stock Quantity</TableHead>
                        <TableHead>Value at Risk</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData?.expiryReport.expiringProducts.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            {new Date(product.expiryDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              product.daysUntilExpiry < 0 ? "destructive" :
                              product.daysUntilExpiry <= 7 ? "default" :
                              "outline"
                            }>
                              {product.daysUntilExpiry < 0 ? 'Expired' : `${product.daysUntilExpiry} days`}
                            </Badge>
                          </TableCell>
                          <TableCell>{product.stockQuantity}</TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(product.value)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${
                              product.status === 'safe' ? 'bg-green-100 text-green-800' :
                              product.status === 'expiring_soon' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {getExpiryStatusText(product.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant={
                              product.status === 'expired' ? "destructive" :
                              product.status === 'expiring_soon' ? "default" :
                              "outline"
                            }>
                              {product.status === 'expired' ? 'Dispose' :
                               product.status === 'expiring_soon' ? 'Discount' :
                               'Monitor'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* STOCK MOVEMENT TAB */}
            <TabsContent value="movement" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* FAST MOVING PRODUCTS */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fast Moving Products</CardTitle>
                    <CardDescription>High turnover rate products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Sales Count</TableHead>
                          <TableHead>Current Stock</TableHead>
                          <TableHead>Turnover Rate</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData?.movementReport.fastMoving.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{formatNumber(product.salesCount)}</TableCell>
                            <TableCell>
                              <span className={product.stockQuantity < 20 ? 'text-red-600 font-semibold' : ''}>
                                {product.stockQuantity}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default" className="font-semibold">
                                {product.turnoverRate.toFixed(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={product.stockQuantity < 20 ? "destructive" : "default"}>
                                {product.stockQuantity < 20 ? 'Restock Needed' : 'Healthy'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* SLOW MOVING PRODUCTS */}
                <Card>
                  <CardHeader>
                    <CardTitle>Slow Moving Products</CardTitle>
                    <CardDescription>Low turnover rate products</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Sales Count</TableHead>
                          <TableHead>Current Stock</TableHead>
                          <TableHead>Turnover Rate</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reportData?.movementReport.slowMoving.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{formatNumber(product.salesCount)}</TableCell>
                            <TableCell>{product.stockQuantity}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-semibold">
                                {product.turnoverRate.toFixed(2)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                Create Promotion
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* TURNOVER ANALYSIS */}
              <Card>
                <CardHeader>
                  <CardTitle>Turnover Rate Analysis</CardTitle>
                  <CardDescription>Overall inventory performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Average Turnover Rate</p>
                        <p className="text-sm text-gray-600">Across all products</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{reportData?.movementReport.summary.avgTurnoverRate.toFixed(1)}</p>
                        <Badge variant={
                          (reportData?.movementReport.summary.avgTurnoverRate || 0) > 3 ? "default" :
                          (reportData?.movementReport.summary.avgTurnoverRate || 0) > 1.5 ? "outline" :
                          "destructive"
                        }>
                          {(reportData?.movementReport.summary.avgTurnoverRate || 0) > 3 ? 'Excellent' :
                           (reportData?.movementReport.summary.avgTurnoverRate || 0) > 1.5 ? 'Average' :
                           'Poor'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Fast Moving Products</p>
                            <p className="text-sm text-gray-600">High turnover rate</p>
                          </div>
                          <p className="text-2xl font-bold text-green-600">{reportData?.movementReport.summary.topMovingCount}</p>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Slow Moving Products</p>
                            <p className="text-sm text-gray-600">Low turnover rate</p>
                          </div>
                          <p className="text-2xl font-bold text-red-600">{reportData?.movementReport.summary.slowMovingCount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* EXPORT SECTION */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Export Reports</CardTitle>
              <CardDescription>Download inventory analytics in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export as CSV
                </Button>
                <Button
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export as PDF
                </Button>
                <Button
                  onClick={() => handleExport('excel')}
                  disabled={exporting}
                  variant="outline"
                  className="flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export as Excel
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray-500">
                Reports include {reportType} data with current filters applied
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default InventoryReport;