// File: /pages/admin/CustomerReport.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
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
  Star,
  Clock,
  Target,
  Percent,
  Eye,
  UserCheck,
  UserX,
  Activity,
  MapPin
} from 'lucide-react';
import axios from 'axios';
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

interface CustomerReportData {
  metrics: {
    totalCustomers: number;
    activeCustomers: number;
    newCustomers: number;
    returningRate: number;
    avgCLV: number;
    totalRevenue: number;
    avgOrderFrequency: number;
  };
  acquisitionData: Array<{
    date: string;
    newCustomers: number;
  }>;
  topCustomers: Array<{
    _id: string;
    name: string;
    email: string;
    totalSpent: number;
    orderCount: number;
    averageOrderValue: number;
    firstOrderDate: string;
    lastOrderDate: string;
    clv: number;
  }>;
  segments: Array<{
    segment: string;
    count: number;
    percentage: number;
    avgSpent: number;
  }>;
  demographics: {
    ageGroups: Array<{ group: string; count: number }>;
    locations: Array<{ city: string; count: number }>;
    acquisitionSources: Array<{ source: string; count: number }>;
  };
}

const CustomerReport: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  /* ================= STATE ================= */
  const [reportData, setReportData] = useState<CustomerReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  
  // Filters
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1),
    new Date()
  ]);
  const [reportType, setReportType] = useState('overview');
  const [customerSegment, setCustomerSegment] = useState('all');
  
  // Chart data state
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/auth');
    }
  }, [isAuthenticated, user, navigate]);

  /* ================= FETCH REPORT DATA ================= */
  useEffect(() => {
    fetchReportData();
  }, [dateRange, customerSegment]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Using the reportAPI service instead of direct axios
      const { reportAPI } = await import('@/services/api');
      
      const params = {
        startDate: dateRange[0].toISOString().split('T')[0],
        endDate: dateRange[1].toISOString().split('T')[0],
        customerType: customerSegment !== 'all' ? customerSegment : undefined
      };

      const response = await reportAPI.getCustomerReport(params);
      setReportData(response.data);

    } catch (error) {
      console.error('Error fetching customer report:', error);
      
      // Fallback to mock data
      const mockReportData: CustomerReportData = {
        metrics: {
          totalCustomers: 1250,
          activeCustomers: 890,
          newCustomers: 145,
          returningRate: 71.2,
          avgCLV: 450.75,
          totalRevenue: 562437.50,
          avgOrderFrequency: 3.2
        },
        acquisitionData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          newCustomers: Math.floor(Math.random() * 20) + 5
        })),
        topCustomers: [
          {
            _id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            totalSpent: 2450.50,
            orderCount: 15,
            averageOrderValue: 163.37,
            firstOrderDate: '2024-01-15',
            lastOrderDate: '2024-03-20',
            clv: 2450.50
          },
          {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            totalSpent: 1875.25,
            orderCount: 12,
            averageOrderValue: 156.27,
            firstOrderDate: '2024-02-10',
            lastOrderDate: '2024-03-19',
            clv: 1875.25
          },
          {
            _id: '3',
            name: 'Robert Johnson',
            email: 'robert@example.com',
            totalSpent: 1620.00,
            orderCount: 8,
            averageOrderValue: 202.50,
            firstOrderDate: '2024-01-05',
            lastOrderDate: '2024-03-18',
            clv: 1620.00
          },
          {
            _id: '4',
            name: 'Sarah Williams',
            email: 'sarah@example.com',
            totalSpent: 1420.75,
            orderCount: 11,
            averageOrderValue: 129.16,
            firstOrderDate: '2024-02-15',
            lastOrderDate: '2024-03-17',
            clv: 1420.75
          },
          {
            _id: '5',
            name: 'Michael Brown',
            email: 'michael@example.com',
            totalSpent: 1380.50,
            orderCount: 9,
            averageOrderValue: 153.39,
            firstOrderDate: '2024-01-20',
            lastOrderDate: '2024-03-16',
            clv: 1380.50
          }
        ],
        segments: [
          { segment: 'High Value', count: 125, percentage: 10, avgSpent: 850.50 },
          { segment: 'Medium Value', count: 625, percentage: 50, avgSpent: 350.25 },
          { segment: 'Low Value', count: 375, percentage: 30, avgSpent: 120.75 },
          { segment: 'At Risk', count: 75, percentage: 6, avgSpent: 45.50 },
          { segment: 'Churned', count: 50, percentage: 4, avgSpent: 0 }
        ],
        demographics: {
          ageGroups: [
            { group: '18-24', count: 150 },
            { group: '25-34', count: 450 },
            { group: '35-44', count: 350 },
            { group: '45-54', count: 200 },
            { group: '55+', count: 100 }
          ],
          locations: [
            { city: 'New York', count: 250 },
            { city: 'Los Angeles', count: 180 },
            { city: 'Chicago', count: 120 },
            { city: 'Houston', count: 90 },
            { city: 'Phoenix', count: 75 }
          ],
          acquisitionSources: [
            { source: 'Organic Search', count: 350 },
            { source: 'Social Media', count: 280 },
            { source: 'Email Marketing', count: 220 },
            { source: 'Referral', count: 180 },
            { source: 'Direct', count: 120 }
          ]
        }
      };

      setReportData(mockReportData);
      
      toast({
        title: 'Using Demo Data',
        description: 'Backend not available. Showing demo data.',
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
        startDate: dateRange[0].toISOString().split('T')[0],
        endDate: dateRange[1].toISOString().split('T')[0],
        customerType: customerSegment !== 'all' ? customerSegment : undefined
      };

      toast({
        title: 'Export Started',
        description: `Exporting customer report as ${format.toUpperCase()}...`
      });

      const response = await reportAPI.exportReport('customers', format, params);
      reportAPI.downloadFile(response.data, `customer-report-${Date.now()}.${format}`);

      toast({
        title: 'Export Complete',
        description: `Customer report exported as ${format.toUpperCase()}`
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

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSegmentColor = (segment: string) => {
    const colors: Record<string, string> = {
      'High Value': 'bg-green-500',
      'Medium Value': 'bg-blue-500',
      'Low Value': 'bg-yellow-500',
      'At Risk': 'bg-orange-500',
      'Churned': 'bg-red-500'
    };
    return colors[segment] || 'bg-gray-500';
  };

  // Handle date input changes
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setDateRange([newDate, dateRange[1]]);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setDateRange([dateRange[0], newDate]);
    }
  };

  // Format date for input[type="date"]
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading customer analytics...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Customer Analytics</h1>
                <p className="text-gray-600 mt-1">
                  In-depth customer insights, lifetime value analysis, and segmentation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={fetchReportData} variant="outline" disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="acquisition">Acquisition</SelectItem>
                  <SelectItem value="segmentation">Segmentation</SelectItem>
                  <SelectItem value="demographics">Demographics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DATE FILTER - Fixed with simple inputs */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Date Range
              </CardTitle>
              <CardDescription>Select the time period for analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={formatDateForInput(dateRange[0])}
                    onChange={handleStartDateChange}
                    className="w-40"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="date"
                    value={formatDateForInput(dateRange[1])}
                    onChange={handleEndDateChange}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const lastMonth = new Date();
                      lastMonth.setMonth(lastMonth.getMonth() - 1);
                      setDateRange([lastMonth, new Date()]);
                    }}
                  >
                    Last Month
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const lastSixMonths = new Date();
                      lastSixMonths.setMonth(lastSixMonths.getMonth() - 6);
                      setDateRange([lastSixMonths, new Date()]);
                    }}
                  >
                    Last 6 Months
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const yearStart = new Date(new Date().getFullYear(), 0, 1);
                      setDateRange([yearStart, new Date()]);
                    }}
                  >
                    Year to Date
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected range: {formatDate(dateRange[0])} to {formatDate(dateRange[1])}
              </p>
            </CardContent>
          </Card>

          {/* KEY METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{reportData?.metrics.totalCustomers.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Total Customers</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+12.5% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{formatPercent(reportData?.metrics.returningRate || 0)}</p>
                    <p className="text-sm text-gray-600">Returning Rate</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
                <div className="mt-2">
                  <Progress value={reportData?.metrics.returningRate || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(reportData?.metrics.avgCLV || 0)}</p>
                    <p className="text-sm text-gray-600">Avg Customer Lifetime Value</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+8.2% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{reportData?.metrics.avgOrderFrequency.toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Avg Order Frequency</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-orange-500" />
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+0.3 from last period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MAIN CONTENT */}
          <Tabs defaultValue="overview" value={reportType} onValueChange={setReportType}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="acquisition" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Acquisition
              </TabsTrigger>
              <TabsTrigger value="segmentation" className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Segmentation
              </TabsTrigger>
              <TabsTrigger value="demographics" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Demographics
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              {/* CUSTOMER SEGMENTS */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Segments</CardTitle>
                  <CardDescription>Distribution of customers by value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData?.segments.map((segment) => (
                      <div key={segment.segment} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getSegmentColor(segment.segment)}`} />
                            <span className="font-medium">{segment.segment}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-semibold">{segment.count.toLocaleString()} customers</span>
                            <span className="text-gray-600">{segment.percentage}%</span>
                            <span className="text-gray-600">{formatCurrency(segment.avgSpent)} avg</span>
                          </div>
                        </div>
                        <Progress value={segment.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* TOP CUSTOMERS */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers by Lifetime Value</CardTitle>
                  <CardDescription>Your most valuable customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Avg Order</TableHead>
                        <TableHead>First Purchase</TableHead>
                        <TableHead>Last Purchase</TableHead>
                        <TableHead>Lifetime Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData?.topCustomers.map((customer) => (
                        <TableRow key={customer._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-gray-500">{customer.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <span className="font-semibold">{customer.orderCount}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(customer.totalSpent)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(customer.averageOrderValue)}
                          </TableCell>
                          <TableCell>
                            {new Date(customer.firstOrderDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(customer.lastOrderDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="font-semibold">
                              {formatCurrency(customer.clv)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ACQUISITION TAB */}
            <TabsContent value="acquisition" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Acquisition Trend</CardTitle>
                  <CardDescription>New customers over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center border rounded-lg bg-gray-50">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Acquisition chart would be displayed here</p>
                      <p className="text-sm text-gray-400">Showing {reportData?.acquisitionData.length} days of data</p>
                      <div className="mt-4 text-xs text-gray-500">
                        <p>Sample data for: {formatDate(dateRange[0])} to {formatDate(dateRange[1])}</p>
                        <p>Total new customers: {reportData?.acquisitionData.reduce((sum, day) => sum + day.newCustomers, 0)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Acquisition Sources</CardTitle>
                  <CardDescription>Where your customers come from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData?.demographics.acquisitionSources.map((source) => (
                      <div key={source.source} className="flex items-center justify-between">
                        <span className="font-medium">{source.source}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">{source.count.toLocaleString()} customers</span>
                          <Badge variant="outline">
                            {((source.count / (reportData?.metrics.totalCustomers || 1)) * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEGMENTATION TAB */}
            <TabsContent value="segmentation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Segmentation Analysis</CardTitle>
                  <CardDescription>Detailed breakdown of customer segments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportData?.segments.map((segment) => (
                      <Card key={segment.segment}>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getSegmentColor(segment.segment)}`} />
                            {segment.segment}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="text-center">
                              <p className="text-3xl font-bold">{segment.count.toLocaleString()}</p>
                              <p className="text-gray-600">Customers</p>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Percentage:</span>
                                <span className="font-semibold">{segment.percentage}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Avg Spending:</span>
                                <span className="font-semibold">{formatCurrency(segment.avgSpent)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Value:</span>
                                <span className="font-semibold">
                                  {formatCurrency(segment.count * segment.avgSpent)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* DEMOGRAPHICS TAB */}
            <TabsContent value="demographics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AGE GROUPS */}
                <Card>
                  <CardHeader>
                    <CardTitle>Age Distribution</CardTitle>
                    <CardDescription>Customer age groups</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData?.demographics.ageGroups.map((ageGroup) => (
                        <div key={ageGroup.group} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{ageGroup.group}</span>
                            <span className="text-gray-600">
                              {ageGroup.count.toLocaleString()} customers
                              <span className="ml-2">
                                ({((ageGroup.count / (reportData?.metrics.totalCustomers || 1)) * 100).toFixed(1)}%)
                              </span>
                            </span>
                          </div>
                          <Progress 
                            value={(ageGroup.count / (reportData?.metrics.totalCustomers || 1)) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* LOCATIONS */}
                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                    <CardDescription>Top customer locations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData?.demographics.locations.map((location) => (
                        <div key={location.city} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{location.city}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-gray-600">{location.count.toLocaleString()} customers</span>
                            <Badge variant="outline">
                              {((location.count / (reportData?.metrics.totalCustomers || 1)) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* EXPORT SECTION */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Export Reports</CardTitle>
              <CardDescription>Download customer analytics in various formats</CardDescription>
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
                Reports include all data for the selected date range: {formatDate(dateRange[0])} to {formatDate(dateRange[1])}
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomerReport;