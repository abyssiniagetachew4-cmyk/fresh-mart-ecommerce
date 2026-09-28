// File: /pages/AdminDelivery.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Clock,
  Calendar,
  Package,
  User,
  Phone,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreVertical,
  ArrowLeft,
  RefreshCw,
  ChevronRight,
  Plus,
  Settings,
  Route as RouteIcon
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

interface DeliveryZone {
  _id: string;
  name: string;
  zipCodes: string[];
  deliveryFee: number;
  minOrderAmount: number;
  estimatedDeliveryTime: string; // e.g., "30-45 minutes"
  isActive: boolean;
}

interface DeliverySlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxOrders: number;
  bookedOrders: number;
  isAvailable: boolean;
}

interface DeliveryDriver {
  _id: string;
  name: string;
  phone: string;
  vehicle: string;
  licensePlate: string;
  isActive: boolean;
  currentLocation?: string;
  assignedOrders: number;
}

interface DeliveryAssignment {
  _id: string;
  orderId: string;
  orderNumber: string;
  driver: DeliveryDriver;
  customer: {
    name: string;
    address: string;
    phone: string;
  };
  scheduledTime: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'on_route' | 'delivered' | 'failed';
  estimatedArrival: string;
  actualArrival?: string;
}

const AdminDelivery: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  /* ================= STATE ================= */
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected items
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<DeliveryDriver | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<DeliveryAssignment | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  
  // Modals
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isAssignDriverModalOpen, setIsAssignDriverModalOpen] = useState(false);
  
  // New item forms
  const [newZone, setNewZone] = useState({
    name: '',
    zipCodes: '',
    deliveryFee: '',
    minOrderAmount: '',
    estimatedDeliveryTime: '30-45',
    isActive: true
  });
  
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    maxOrders: '20'
  });

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/auth');
    }
  }, [isAuthenticated, user, navigate]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const fetchDeliveryData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockZones: DeliveryZone[] = [
        {
          _id: '1',
          name: 'Downtown Area',
          zipCodes: ['10001', '10002', '10003'],
          deliveryFee: 2.99,
          minOrderAmount: 15,
          estimatedDeliveryTime: '30-45 minutes',
          isActive: true
        },
        {
          _id: '2',
          name: 'Suburban Zone',
          zipCodes: ['10004', '10005', '10006'],
          deliveryFee: 4.99,
          minOrderAmount: 25,
          estimatedDeliveryTime: '45-60 minutes',
          isActive: true
        },
        {
          _id: '3',
          name: 'Outskirts',
          zipCodes: ['10007', '10008'],
          deliveryFee: 7.99,
          minOrderAmount: 40,
          estimatedDeliveryTime: '60-90 minutes',
          isActive: false
        }
      ];

      const mockSlots: DeliverySlot[] = [
        {
          _id: '1',
          date: '2024-03-25',
          startTime: '09:00',
          endTime: '10:00',
          maxOrders: 20,
          bookedOrders: 15,
          isAvailable: true
        },
        {
          _id: '2',
          date: '2024-03-25',
          startTime: '10:00',
          endTime: '11:00',
          maxOrders: 20,
          bookedOrders: 20,
          isAvailable: false
        },
        {
          _id: '3',
          date: '2024-03-25',
          startTime: '11:00',
          endTime: '12:00',
          maxOrders: 20,
          bookedOrders: 8,
          isAvailable: true
        }
      ];

      const mockDrivers: DeliveryDriver[] = [
        {
          _id: '1',
          name: 'John Driver',
          phone: '+1234567890',
          vehicle: 'Toyota Prius',
          licensePlate: 'ABC123',
          isActive: true,
          currentLocation: 'Downtown',
          assignedOrders: 3
        },
        {
          _id: '2',
          name: 'Mike Rider',
          phone: '+1234567891',
          vehicle: 'Honda Civic',
          licensePlate: 'XYZ789',
          isActive: true,
          currentLocation: 'Suburban Area',
          assignedOrders: 2
        },
        {
          _id: '3',
          name: 'Alex Wheeler',
          phone: '+1234567892',
          vehicle: 'Ford Transit',
          licensePlate: 'DEF456',
          isActive: false,
          assignedOrders: 0
        }
      ];

      const mockAssignments: DeliveryAssignment[] = [
        {
          _id: '1',
          orderId: 'ORD001',
          orderNumber: '#1001',
          driver: mockDrivers[0],
          customer: {
            name: 'John Doe',
            address: '123 Main St, Downtown',
            phone: '+1234567890'
          },
          scheduledTime: '2024-03-25T09:30:00Z',
          status: 'on_route',
          estimatedArrival: '2024-03-25T10:15:00Z'
        },
        {
          _id: '2',
          orderId: 'ORD002',
          orderNumber: '#1002',
          driver: mockDrivers[1],
          customer: {
            name: 'Jane Smith',
            address: '456 Oak Ave, Suburban',
            phone: '+1234567891'
          },
          scheduledTime: '2024-03-25T10:00:00Z',
          status: 'assigned',
          estimatedArrival: '2024-03-25T11:00:00Z'
        },
        {
          _id: '3',
          orderId: 'ORD003',
          orderNumber: '#1003',
          driver: mockDrivers[0],
          customer: {
            name: 'Robert Johnson',
            address: '789 Pine Rd, Outskirts',
            phone: '+1234567892'
          },
          scheduledTime: '2024-03-25T11:30:00Z',
          status: 'pending',
          estimatedArrival: '2024-03-25T12:30:00Z'
        }
      ];

      setDeliveryZones(mockZones);
      setDeliverySlots(mockSlots);
      setDrivers(mockDrivers);
      setAssignments(mockAssignments);

      // Uncomment when you have backend APIs:
      // const [zonesRes, slotsRes, driversRes, assignmentsRes] = await Promise.all([
      //   axios.get('http://localhost:5000/api/delivery/zones'),
      //   axios.get('http://localhost:5000/api/delivery/slots'),
      //   axios.get('http://localhost:5000/api/delivery/drivers'),
      //   axios.get('http://localhost:5000/api/delivery/assignments')
      // ]);
      
      // setDeliveryZones(zonesRes.data.zones || []);
      // setDeliverySlots(slotsRes.data.slots || []);
      // setDrivers(driversRes.data.drivers || []);
      // setAssignments(assignmentsRes.data.assignments || []);

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load delivery data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= FILTERING ================= */
  const filteredAssignments = assignments.filter(assignment => {
    if (searchTerm && !assignment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !assignment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && assignment.status !== statusFilter) {
      return false;
    }
    if (dateFilter && !assignment.scheduledTime.startsWith(dateFilter)) {
      return false;
    }
    return true;
  });

  /* ================= ACTIONS ================= */
  const handleAddZone = () => {
    const newZoneObj: DeliveryZone = {
      _id: Date.now().toString(),
      name: newZone.name,
      zipCodes: newZone.zipCodes.split(',').map(zip => zip.trim()),
      deliveryFee: parseFloat(newZone.deliveryFee),
      minOrderAmount: parseFloat(newZone.minOrderAmount),
      estimatedDeliveryTime: `${newZone.estimatedDeliveryTime} minutes`,
      isActive: newZone.isActive
    };

    setDeliveryZones([...deliveryZones, newZoneObj]);
    setNewZone({
      name: '',
      zipCodes: '',
      deliveryFee: '',
      minOrderAmount: '',
      estimatedDeliveryTime: '30-45',
      isActive: true
    });
    setIsZoneModalOpen(false);

    toast({
      title: 'Success',
      description: 'Delivery zone added successfully'
    });
  };

  const handleAddSlot = () => {
    const newSlotObj: DeliverySlot = {
      _id: Date.now().toString(),
      date: newSlot.date,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      maxOrders: parseInt(newSlot.maxOrders),
      bookedOrders: 0,
      isAvailable: true
    };

    setDeliverySlots([...deliverySlots, newSlotObj]);
    setNewSlot({
      date: '',
      startTime: '09:00',
      endTime: '10:00',
      maxOrders: '20'
    });
    setIsSlotModalOpen(false);

    toast({
      title: 'Success',
      description: 'Delivery slot added successfully'
    });
  };

  const handleUpdateAssignmentStatus = (assignmentId: string, newStatus: string) => {
    setAssignments(prev => prev.map(assignment => 
      assignment._id === assignmentId 
        ? { ...assignment, status: newStatus as any }
        : assignment
    ));

    toast({
      title: 'Success',
      description: `Delivery status updated to ${newStatus.replace('_', ' ')}`
    });
  };

  const handleAssignDriver = (assignmentId: string, driverId: string) => {
    const driver = drivers.find(d => d._id === driverId);
    if (!driver) return;

    setAssignments(prev => prev.map(assignment => 
      assignment._id === assignmentId 
        ? { 
            ...assignment, 
            driver: driver,
            status: 'assigned' 
          }
        : assignment
    ));

    setDrivers(prev => prev.map(d => 
      d._id === driverId 
        ? { ...d, assignedOrders: d.assignedOrders + 1 }
        : d
    ));

    setIsAssignDriverModalOpen(false);
    toast({
      title: 'Success',
      description: `Driver ${driver.name} assigned to delivery`
    });
  };

  /* ================= STATS ================= */
  const deliveryStats = {
    totalDeliveries: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    inProgress: assignments.filter(a => a.status === 'assigned' || a.status === 'picked_up' || a.status === 'on_route').length,
    delivered: assignments.filter(a => a.status === 'delivered').length,
    activeDrivers: drivers.filter(d => d.isActive).length,
    availableSlots: deliverySlots.filter(s => s.isAvailable && s.bookedOrders < s.maxOrders).length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading delivery data...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Delivery & Logistics</h1>
                <p className="text-gray-600 mt-1">
                  Manage delivery zones, time slots, drivers, and track deliveries
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={fetchDeliveryData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{deliveryStats.totalDeliveries}</p>
                    <p className="text-sm text-gray-600">Total Deliveries</p>
                  </div>
                  <Truck className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{deliveryStats.pending}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{deliveryStats.inProgress}</p>
                    <p className="text-sm text-gray-600">In Progress</p>
                  </div>
                  <Package className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{deliveryStats.delivered}</p>
                    <p className="text-sm text-gray-600">Delivered</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{deliveryStats.activeDrivers}</p>
                    <p className="text-sm text-gray-600">Active Drivers</p>
                  </div>
                  <User className="w-8 h-8 text-indigo-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{deliveryStats.availableSlots}</p>
                    <p className="text-sm text-gray-600">Available Slots</p>
                  </div>
                  <Calendar className="w-8 h-8 text-pink-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Delivery Zones</h3>
                    <p className="text-sm text-gray-600">{deliveryZones.length} zones configured</p>
                  </div>
                  <Button size="sm" onClick={() => setIsZoneModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Zone
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Time Slots</h3>
                    <p className="text-sm text-gray-600">{deliverySlots.length} slots available</p>
                  </div>
                  <Button size="sm" onClick={() => setIsSlotModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Slot
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Delivery Drivers</h3>
                    <p className="text-sm text-gray-600">{drivers.filter(d => d.isActive).length} active</p>
                  </div>
                  <Button size="sm" onClick={() => setIsDriverModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Driver
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* MAIN TABS */}
          <Tabs defaultValue="deliveries" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="deliveries" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Active Deliveries ({assignments.length})
              </TabsTrigger>
              <TabsTrigger value="zones" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Delivery Zones ({deliveryZones.length})
              </TabsTrigger>
              <TabsTrigger value="slots" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Time Slots ({deliverySlots.length})
              </TabsTrigger>
              <TabsTrigger value="drivers" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Drivers ({drivers.length})
              </TabsTrigger>
            </TabsList>

            {/* DELIVERIES TAB */}
            <TabsContent value="deliveries">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Assignments</CardTitle>
                  <CardDescription>Track and manage all active deliveries</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* FILTERS */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="md:col-span-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search by customer name or order #..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="on_route">On Route</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      placeholder="Filter by date"
                    />
                  </div>

                  {/* DELIVERIES TABLE */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order #</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Scheduled Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssignments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <Truck className="w-12 h-12 mx-auto text-gray-300" />
                              <p className="mt-2 text-gray-500">No delivery assignments found</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAssignments.map((assignment) => (
                            <TableRow key={assignment._id} className="hover:bg-gray-50">
                              <TableCell className="font-semibold">
                                {assignment.orderNumber}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{assignment.customer.name}</span>
                                  <span className="text-xs text-gray-500">{assignment.customer.address}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {assignment.driver ? (
                                  <div className="flex flex-col">
                                    <span className="font-medium">{assignment.driver.name}</span>
                                    <span className="text-xs text-gray-500">{assignment.driver.vehicle}</span>
                                  </div>
                                ) : (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                    Unassigned
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span>{format(new Date(assignment.scheduledTime), 'MMM dd, yyyy')}</span>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(assignment.scheduledTime), 'h:mm a')}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {assignment.status === 'pending' && (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-0">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                                {assignment.status === 'assigned' && (
                                  <Badge className="bg-blue-100 text-blue-800 border-0">
                                    <User className="w-3 h-3 mr-1" />
                                    Assigned
                                  </Badge>
                                )}
                                {assignment.status === 'on_route' && (
                                  <Badge className="bg-purple-100 text-purple-800 border-0">
                                    <Truck className="w-3 h-3 mr-1" />
                                    On Route
                                  </Badge>
                                )}
                                {assignment.status === 'delivered' && (
                                  <Badge className="bg-green-100 text-green-800 border-0">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Delivered
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedAssignment(assignment);
                                      setIsAssignmentModalOpen(true);
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
                                          setSelectedAssignment(assignment);
                                          setIsAssignmentModalOpen(true);
                                        }}
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      {!assignment.driver && (
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedAssignment(assignment);
                                            setIsAssignDriverModalOpen(true);
                                          }}
                                        >
                                          <User className="w-4 h-4 mr-2" />
                                          Assign Driver
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      {assignment.status === 'pending' && (
                                        <DropdownMenuItem
                                          onClick={() => handleUpdateAssignmentStatus(assignment._id, 'assigned')}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Mark as Assigned
                                        </DropdownMenuItem>
                                      )}
                                      {assignment.status === 'assigned' && (
                                        <DropdownMenuItem
                                          onClick={() => handleUpdateAssignmentStatus(assignment._id, 'on_route')}
                                        >
                                          <Truck className="w-4 h-4 mr-2" />
                                          Mark as On Route
                                        </DropdownMenuItem>
                                      )}
                                      {assignment.status === 'on_route' && (
                                        <DropdownMenuItem
                                          onClick={() => handleUpdateAssignmentStatus(assignment._id, 'delivered')}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Mark as Delivered
                                        </DropdownMenuItem>
                                      )}
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* ZONES TAB */}
            <TabsContent value="zones">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Zones</CardTitle>
                  <CardDescription>Configure delivery areas, fees, and restrictions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deliveryZones.map((zone) => (
                      <Card key={zone._id} className={zone.isActive ? '' : 'opacity-70'}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                              <Badge variant={zone.isActive ? "default" : "secondary"}>
                                {zone.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <MapPin className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Zip Codes</p>
                              <p className="text-gray-800">{zone.zipCodes.join(', ')}</p>
                            </div>
                            <div className="flex justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-600">Delivery Fee</p>
                                <p className="text-lg font-semibold">${zone.deliveryFee.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600">Min Order</p>
                                <p className="text-lg font-semibold">${zone.minOrderAmount.toFixed(2)}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Estimated Time</p>
                              <p className="text-gray-800">{zone.estimatedDeliveryTime}</p>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full mt-4">
                            <Settings className="w-4 h-4 mr-2" />
                            Edit Zone
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SLOTS TAB */}
            <TabsContent value="slots">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Time Slots</CardTitle>
                  <CardDescription>Manage available delivery time windows</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Time Slot</TableHead>
                          <TableHead>Capacity</TableHead>
                          <TableHead>Booked</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deliverySlots.map((slot) => (
                          <TableRow key={slot._id} className="hover:bg-gray-50">
                            <TableCell>
                              {format(new Date(slot.date), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              {slot.startTime} - {slot.endTime}
                            </TableCell>
                            <TableCell>{slot.maxOrders}</TableCell>
                            <TableCell>{slot.bookedOrders}</TableCell>
                            <TableCell>{slot.maxOrders - slot.bookedOrders}</TableCell>
                            <TableCell>
                              {slot.isAvailable && slot.bookedOrders < slot.maxOrders ? (
                                <Badge className="bg-green-100 text-green-800 border-0">
                                  Available
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800 border-0">
                                  Full
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* DRIVERS TAB */}
            <TabsContent value="drivers">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Drivers</CardTitle>
                  <CardDescription>Manage driver accounts and assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {drivers.map((driver) => (
                      <Card key={driver._id} className={driver.isActive ? '' : 'opacity-70'}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">{driver.name}</h3>
                              <Badge variant={driver.isActive ? "default" : "secondary"}>
                                {driver.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <User className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Contact</p>
                              <p className="text-gray-800">{driver.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Vehicle</p>
                              <p className="text-gray-800">{driver.vehicle} ({driver.licensePlate})</p>
                            </div>
                            {driver.currentLocation && (
                              <div>
                                <p className="text-sm font-medium text-gray-600">Current Location</p>
                                <p className="text-gray-800">{driver.currentLocation}</p>
                              </div>
                            )}
                            <div className="flex justify-between items-center pt-2 border-t">
                              <span className="text-sm font-medium">Assigned Orders</span>
                              <Badge>{driver.assignedOrders}</Badge>
                            </div>
                          </div>
                          <Button variant="outline" className="w-full mt-4">
                            <Edit className="w-4 h-4 mr-2" />
                            Manage Driver
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* ADD ZONE MODAL */}
      <Dialog open={isZoneModalOpen} onOpenChange={setIsZoneModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Delivery Zone</DialogTitle>
            <DialogDescription>Configure a new delivery area</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Zone Name</label>
              <Input 
                value={newZone.name}
                onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                placeholder="e.g., Downtown Area"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Zip Codes (comma separated)</label>
              <Input 
                value={newZone.zipCodes}
                onChange={(e) => setNewZone({...newZone, zipCodes: e.target.value})}
                placeholder="e.g., 10001, 10002, 10003"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Delivery Fee ($)</label>
                <Input 
                  type="number"
                  value={newZone.deliveryFee}
                  onChange={(e) => setNewZone({...newZone, deliveryFee: e.target.value})}
                  placeholder="2.99"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Min Order Amount ($)</label>
                <Input 
                  type="number"
                  value={newZone.minOrderAmount}
                  onChange={(e) => setNewZone({...newZone, minOrderAmount: e.target.value})}
                  placeholder="15.00"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Estimated Delivery Time (minutes)</label>
              <Select 
                value={newZone.estimatedDeliveryTime}
                onValueChange={(value) => setNewZone({...newZone, estimatedDeliveryTime: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15-30">15-30 minutes</SelectItem>
                  <SelectItem value="30-45">30-45 minutes</SelectItem>
                  <SelectItem value="45-60">45-60 minutes</SelectItem>
                  <SelectItem value="60-90">60-90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={newZone.isActive}
                onChange={(e) => setNewZone({...newZone, isActive: e.target.checked})}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm">Active Zone</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsZoneModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddZone}>
              Add Delivery Zone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD SLOT MODAL */}
      <Dialog open={isSlotModalOpen} onOpenChange={setIsSlotModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Delivery Time Slot</DialogTitle>
            <DialogDescription>Create a new delivery time window</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input 
                type="date"
                value={newSlot.date}
                onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time</label>
                <Input 
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Time</label>
                <Input 
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Maximum Orders</label>
              <Input 
                type="number"
                value={newSlot.maxOrders}
                onChange={(e) => setNewSlot({...newSlot, maxOrders: e.target.value})}
                placeholder="20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSlotModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSlot}>
              Add Time Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ASSIGN DRIVER MODAL */}
      <Dialog open={isAssignDriverModalOpen} onOpenChange={setIsAssignDriverModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
            <DialogDescription>
              Assign a driver to order {selectedAssignment?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select onValueChange={(driverId) => selectedAssignment && handleAssignDriver(selectedAssignment._id, driverId)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.filter(d => d.isActive).map((driver) => (
                  <SelectItem key={driver._id} value={driver._id}>
                    {driver.name} ({driver.vehicle}) - {driver.assignedOrders} assigned
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDriverModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminDelivery;