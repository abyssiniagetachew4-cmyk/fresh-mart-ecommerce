// File: /pages/AdminProducts.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Eye,
  Trash2,
  Layers,
  Tag,
  AlertTriangle,
  ChevronDown,
  MoreVertical,
  CheckSquare,
  Square
} from 'lucide-react';
import axios from 'axios';
import { toast } from '../hooks/use-toast';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductFormModal from '../components/admin/ProductFormModal';
import BulkImportExport from '../components/admin/BulkImportExport';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: {
    _id: string;
    name: string;
  };
  brand: string;
  sku: string;
  description: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  lowStockThreshold: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  productCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  /* ================= STATE ================= */
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  
  // Bulk actions
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isSelectAll, setIsSelectAll] = useState(false);
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/auth');
    }
  }, [isAuthenticated, user, navigate]);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/products/admin/all');
      setProducts(res.data.products || []);
      setFilteredProducts(res.data.products || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

const fetchCategories = async () => {
  try {
    console.log('Fetching categories from API...');
    const res = await axios.get('http://localhost:5000/api/categories');
    
    console.log('=== CATEGORIES API RESPONSE ===');
    console.log('Full response:', res);
    console.log('Response data:', res.data);
    console.log('Response status:', res.status);
    
    // Check EVERY possible structure
    let categoriesData = [];
    
    if (Array.isArray(res.data)) {
      console.log('Categories found as direct array');
      categoriesData = res.data;
    } 
    else if (res.data && Array.isArray(res.data.categories)) {
      console.log('Categories found in res.data.categories');
      categoriesData = res.data.categories;
    }
    else if (res.data && Array.isArray(res.data.data)) {
      console.log('Categories found in res.data.data');
      categoriesData = res.data.data;
    }
    else if (res.data?.data && Array.isArray(res.data.data.categories)) {
      console.log('Categories found in res.data.data.categories');
      categoriesData = res.data.data.categories;
    }
    else if (res.data?.success && Array.isArray(res.data.data)) {
      console.log('Categories found in success.data');
      categoriesData = res.data.data;
    }
    else {
      console.log('No categories found in expected format. Checking all keys:');
      console.log(Object.keys(res.data || {}));
    }
    
    console.log('Final categories data:', categoriesData);
    console.log('Number of categories found:', categoriesData.length);
    
    setCategories(categoriesData);
    
  } catch (error: any) {
    console.error('ERROR fetching categories:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    toast({
      title: 'Categories Error',
      description: `Failed to load categories: ${error.message}`,
      variant: 'destructive'
    });
    
    setCategories([]);
  }
};

  /* ================= FILTERING ================= */
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category?._id === selectedCategory
      );
    }

    // Stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter(product => 
        product.stock <= product.lowStockThreshold
      );
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(product => product.stock === 0);
    } else if (stockFilter === 'in-stock') {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(product => product.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(product => !product.isActive);
    } else if (statusFilter === 'featured') {
      filtered = filtered.filter(product => product.isFeatured);
    }

    // Price range filter
    if (priceRange.min) {
      const min = parseFloat(priceRange.min);
      filtered = filtered.filter(product => product.price >= min);
    }
    if (priceRange.max) {
      const max = parseFloat(priceRange.max);
      filtered = filtered.filter(product => product.price <= max);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [products, searchTerm, selectedCategory, stockFilter, statusFilter, priceRange]);

  /* ================= BULK ACTIONS ================= */
  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedProducts([]);
      setIsSelectAll(false);
    } else {
      const allIds = filteredProducts.map(p => p._id);
      setSelectedProducts(allIds);
      setIsSelectAll(true);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        const newSelection = prev.filter(id => id !== productId);
        setIsSelectAll(newSelection.length === filteredProducts.length);
        return newSelection;
      } else {
        const newSelection = [...prev, productId];
        setIsSelectAll(newSelection.length === filteredProducts.length);
        return newSelection;
      }
    });
  };

  const handleBulkUpdateStatus = async (status: boolean) => {
    try {
      await axios.put('http://localhost:5000/api/products/admin/bulk-update', {
        productIds: selectedProducts,
        updates: { isActive: status }
      });

      toast({
        title: 'Success',
        description: `Updated ${selectedProducts.length} products`
      });

      // Update local state
      setProducts(prev => prev.map(product => 
        selectedProducts.includes(product._id) 
          ? { ...product, isActive: status }
          : product
      ));

      setSelectedProducts([]);
      setIsSelectAll(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update products',
        variant: 'destructive'
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await axios.post('http://localhost:5000/api/products/admin/bulk-delete', {
        productIds: selectedProducts
      });

      toast({
        title: 'Success',
        description: `Deleted ${selectedProducts.length} products`
      });

      // Remove deleted products from state
      setProducts(prev => prev.filter(p => !selectedProducts.includes(p._id)));

      setIsDeleteDialogOpen(false);
      setSelectedProducts([]);
      setIsSelectAll(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete products',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/admin/${productId}`);
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      });

      setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };

  /* ================= PAGINATION ================= */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  /* ================= RENDER ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading products...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-1">
                Manage your grocery products, inventory, and categories
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsBulkModalOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import/Export
              </Button>
              <Button onClick={() => {
                setSelectedProduct(null);
                setIsFormModalOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{products.length}</p>
                    <p className="text-sm text-gray-600">Total Products</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">
                      {products.filter(p => p.stock <= p.lowStockThreshold).length}
                    </p>
                    <p className="text-sm text-gray-600">Low Stock</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">
                      {products.filter(p => p.isFeatured).length}
                    </p>
                    <p className="text-sm text-gray-600">Featured</p>
                  </div>
                  <Tag className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{categories.length}</p>
                    <p className="text-sm text-gray-600">Categories</p>
                  </div>
                  <Layers className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>



          {/* BULK ACTION BAR */}
          {selectedProducts.length > 0 && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">
                      {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkUpdateStatus(true)}
                    >
                      Activate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkUpdateStatus(false)}
                    >
                      Deactivate
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSelectedProducts([]);
                        setIsSelectAll(false);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* FILTERS */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter products by various criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search products, SKU, or brand..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Stock Status */}
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                {/* Product Status */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Product Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="flex items-center gap-3 mt-4">
                <span className="text-sm font-medium">Price Range:</span>
                <Input
                  type="number"
                  placeholder="Min"
                  className="w-24"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="w-24"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPriceRange({ min: '', max: '' })}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PRODUCTS TABLE */}
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isSelectAll}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Package className="w-12 h-12 mx-auto text-gray-300" />
                          <p className="mt-2 text-gray-500">No products found</p>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedCategory('all');
                              setStockFilter('all');
                              setStatusFilter('all');
                              setPriceRange({ min: '', max: '' });
                            }}
                          >
                            Clear Filters
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentProducts.map((product) => (
                        <TableRow key={product._id} className="hover:bg-gray-50">
                          <TableCell>
                            <Checkbox
                              checked={selectedProducts.includes(product._id)}
                              onCheckedChange={() => handleSelectProduct(product._id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.sku || 'No SKU'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {product.category?.name || 'Uncategorized'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${product.price.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                product.stock === 0 
                                  ? 'bg-red-100 text-red-800' 
                                  : product.stock <= product.lowStockThreshold
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {product.stock}
                              </span>
                              {product.stock <= product.lowStockThreshold && product.stock > 0 && (
                                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant={product.isActive ? "default" : "secondary"}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {product.isFeatured && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setIsFormModalOpen(true);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => navigate(`/products/${product._id}`)}
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
                                      setSelectedProduct(product);
                                      setIsFormModalOpen(true);
                                    }}
                                  >
                                    Edit Product
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => navigate(`/products/${product._id}`)}
                                  >
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteProduct(product._id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Product
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

              {/* PAGINATION */}
              {filteredProducts.length > itemsPerPage && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
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

          {/* CATEGORIES SECTION */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Categories</h2>
              <Button variant="outline" onClick={() => navigate('/admin/categories')}>
                Manage Categories
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.slice(0, 12).map(category => (
                <Card key={category._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <Layers className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-gray-500">
                      {category.productCount || 0} products
                    </p>
                  </CardContent>
                </Card>
              ))}
              {categories.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center">
                    <Layers className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">No categories found</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/admin/categories')}
                    >
                      Create Category
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODALS */}
      <ProductFormModal
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedProduct(null);
        }}
        onSuccess={() => {
          fetchProducts();
          setIsFormModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        categories={categories}
      />

      <BulkImportExport
        open={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => {
          fetchProducts();
          setIsBulkModalOpen(false);
        }}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminProducts;