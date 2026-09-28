/**
 * TypeScript type definitions for the Grocery E-Commerce application
 * These types define the structure of data used throughout the app
 */

// User role types for role-based access control
export type UserRole = 'customer' | 'admin';

// User interface - represents registered users
export interface User {
  id: string;
   _id?: string; 
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: string;
  token?: string;
}

// Category interface - product categories
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

// Product interface - grocery products
export interface Product {
  _id: string;
  name: string;
  slug?: string;   // ✅ optional now

  price: number;
  originalPrice?: number;
  category: string;
  categoryName?: string;

  image?: string;
  description?: string;

  stock?: number;
  unit?: string;

  rating?: number;
  reviewCount?: number;
  
  
  isNew?: boolean;
   isFeatured?: boolean; 
  createdAt?: string;
}


// Cart item - product in shopping cart
export interface CartItem {
  product: Product;
  quantity: number;
}

// Order status types
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Payment method types
export type PaymentMethod = 'cod' | 'card' | 'upi';

// Order item - product in an order
export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  unit: string;
}

// Order interface - customer orders
export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  phone: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

// Auth context type
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

// Cart context type
export interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// Filter options for product listing
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'newest';
}
