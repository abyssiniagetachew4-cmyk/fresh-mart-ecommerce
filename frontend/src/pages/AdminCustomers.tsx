// File: /pages/AdminCustomers.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  ShoppingCart,
  Star,
  Eye,
  MoreVertical,
  Download,
  ArrowLeft,
  UserPlus,
  RefreshCw,
  ChevronRight,
  Edit,
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

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  createdAt: string;
  lastLogin: string;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
}

const AdminCustomers: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  /* ================= STATE ================= */
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  
  // Modals
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/auth');
    }
  }, [isAuthenticated, user, navigate]);

  /* ================= FETCH CUSTOMERS ================= */
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Using mock data for now since API might not exist
      const mockCustomers: Customer[] = [
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          role: 'customer',
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
          lastLogin: '2024-03-20T14:45:00Z',
          orderCount: 5,
          totalSpent: 245.50,
          averageOrderValue: 49.10
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1234567891',
          role: 'customer',
          isActive: true,
          createdAt: '2024-02-10T09:15:00Z',
          lastLogin: '2024-03-19T11:20:00Z',
          orderCount: 3,
          totalSpent: 120.75,
          averageOrderValue: 40.25
        },
        {
          _id: '3',
          name: 'Robert Johnson',
          email: 'robert@example.com',
          role: 'customer',
          isActive: false,
          createdAt: '2024-01-05T16:45:00Z',
          lastLogin: '2024-02-28T13:10:00Z',
          orderCount: 2,
          totalSpent: 85.00,
          averageOrderValue: 42.50
        }
      ];
      
      setCustomers(mockCustomers);
      setFilteredCustomers(mockCustomers);
      
      // Uncomment this when you have the backend API:
      // const res = await axios.get('http://localhost:5000/api/users/admin/customers');
      // setCustomers(res.data.customers || []);
      // setFilteredCustomers(res.data.customers || []);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTERING & SORTING ================= */
  useEffect(() => {
    let filtered = [...customers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(customer => customer.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(customer => !customer.isActive);
    }

    // Sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'spent':
        filtered.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      case 'orders':
        filtered.sort((a, b) => b.orderCount - a.orderCount);
        break;
    }

    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }, [customers, searchTerm, statusFilter, sortBy]);

  /* ================= CUSTOMER ACTIONS ================= */
  const handleToggleStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      // Uncomment when you have backend API:
      // await axios.put(`http://localhost:5000/api/users/admin/${customerId}/status`, {
      //   isActive: !currentStatus
      // });

      toast({
        title: 'Success',
        description: `Customer ${!currentStatus ? 'activated' : 'deactivated'}`
      });

      // Update local state
      setCustomers(prev => prev.map(customer => 
        customer._id === customerId 
          ? { ...customer, isActive: !currentStatus }
          : customer
      ));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update customer status',
        variant: 'destructive'
      });
    }
  };

  /* ================= STATS ================= */
  const customerStats = {
    total: customers.length,
    active: customers.filter(c => c.isActive).length,
    newThisMonth: customers.filter(c => {
      const created = new Date(c.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0)
  };

  /* ================= PAGINATION ================= */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading customers...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
                <p className="text-gray-600 mt-1">
                  Manage customer accounts, view purchase history, and track customer activity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={fetchCustomers} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{customerStats.total}</p>
                    <p className="text-sm text-gray-600">Total Customers</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{customerStats.active}</p>
                    <p className="text-sm text-gray-600">Active Customers</p>
                  </div>
                  <UserPlus className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{customerStats.newThisMonth}</p>
                    <p className="text-sm text-gray-600">New This Month</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">${customerStats.totalRevenue.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FILTERS */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Filters & Sorting</CardTitle>
              <CardDescription>Find customers by name, email, or other criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort By */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="spent">Total Spent</SelectItem>
                    <SelectItem value="orders">Order Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || statusFilter !== 'all' || sortBy !== 'recent') && (
                <div className="flex justify-end mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setSortBy('recent');
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CUSTOMERS TABLE */}
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Customers ({customers.length})</TabsTrigger>
                  <TabsTrigger value="active">Active ({customerStats.active})</TabsTrigger>
                  <TabsTrigger value="top">Top Spenders</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Total Spent</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentCustomers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <Users className="w-12 h-12 mx-auto text-gray-300" />
                              <p className="mt-2 text-gray-500">No customers found</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          currentCustomers.map((customer) => (
                            <TableRow key={customer._id} className="hover:bg-gray-50">
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{customer.name}</span>
                                  <span className="text-xs text-gray-500">ID: {customer._id.substring(0, 8)}...</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-gray-500" />
                                    <span className="text-sm">{customer.email}</span>
                                  </div>
                                  {customer.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-gray-500" />
                                      <span className="text-sm">{customer.phone}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-center">
                                  <span className="font-semibold">{customer.orderCount}</span>
                                  <p className="text-xs text-gray-500">orders</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <span className="font-semibold">${customer.totalSpent.toFixed(2)}</span>
                                  <p className="text-xs text-gray-500">
                                    ${customer.averageOrderValue.toFixed(2)} avg
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <span className="text-sm">
                                    {new Date(customer.createdAt).toLocaleDateString()}
                                  </span>
                                  <p className="text-xs text-gray-500">
                                    Last login: {new Date(customer.lastLogin).toLocaleDateString()}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={customer.isActive ? "default" : "secondary"}>
                                  {customer.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedCustomer(customer);
                                      setIsDetailsDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="sm" variant="ghost">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedCustomer(customer);
                                          setIsDetailsDialogOpen(true);
                                        }}
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleToggleStatus(customer._id, customer.isActive)}
                                        className={customer.isActive ? "text-red-600" : "text-green-600"}
                                      >
                                        {customer.isActive ? 'Deactivate Account' : 'Activate Account'}
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>

              {/* PAGINATION */}
              {filteredCustomers.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredCustomers.length)} of {filteredCustomers.length} customers
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
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
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
        </div>
      </main>

      {/* CUSTOMER DETAILS DIALOG */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>Customer Details - {selectedCustomer.name}</DialogTitle>
                <DialogDescription>
                  Member since {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* CUSTOMER PROFILE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant={selectedCustomer.isActive ? "default" : "secondary"}>
                          {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(selectedCustomer._id, selectedCustomer.isActive)}
                        >
                          {selectedCustomer.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Purchase Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Orders:</span>
                          <span className="font-semibold">{selectedCustomer.orderCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Total Spent:</span>
                          <span className="font-semibold">${selectedCustomer.totalSpent.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Avg Order:</span>
                          <span className="font-semibold">${selectedCustomer.averageOrderValue.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Last Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <p className="text-sm">
                          Joined: {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm">
                          Last login: {new Date(selectedCustomer.lastLogin).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* CONTACT INFORMATION */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-gray-700">{selectedCustomer.email}</p>
                      </div>
                      {selectedCustomer.phone && (
                        <div>
                          <p className="text-sm font-medium">Phone</p>
                          <p className="text-gray-700">{selectedCustomer.phone}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* QUICK ACTIONS */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button onClick={() => navigate('/admin/orders')}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        View All Orders
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
                        Back to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminCustomers;