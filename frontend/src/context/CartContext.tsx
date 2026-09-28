/**
 * Shopping Cart Context Provider
 * Manages cart state throughout the application
 * Cart is persisted to localStorage for persistence across sessions
 * NOW WITH USER-SPECIFIC CART SUPPORT
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, CartContextType, Product } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext'; // Import auth context

// Create the cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Base storage key for cart
const CART_STORAGE_KEY = 'freshmart_cart';

interface CartProviderProps {
  children: ReactNode;
}

/**
 * CartProvider component that wraps the application
 * and provides cart state and methods
 */
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth(); // Get current user from auth context
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Generate storage key based on user ID
  const getCartStorageKey = (): string => {
    if (user?.id) {
      return `${CART_STORAGE_KEY}_user_${user.id}`;
    } else {
      return `${CART_STORAGE_KEY}_guest`;
    }
  };

  // Load cart from localStorage on mount AND when user changes
  useEffect(() => {
    const storageKey = getCartStorageKey();
    console.log('🔄 Loading cart from storage:', storageKey);
    
    const storedCart = localStorage.getItem(storageKey);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setItems(parsedCart);
        console.log('✅ Cart loaded:', parsedCart.length, 'items');
      } catch (error) {
        console.error('❌ Error parsing stored cart:', error);
        localStorage.removeItem(storageKey);
      }
    } else {
      console.log('🆕 No existing cart found, starting fresh');
    }
    
    setIsInitialized(true);
  }, [user?.id]); // Re-run when user changes

  // Save cart to localStorage whenever it changes OR when user changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const storageKey = getCartStorageKey();
    console.log('💾 Saving cart to storage:', storageKey, items.length, 'items');
    
    localStorage.setItem(storageKey, JSON.stringify(items));
    
    // Clean up old guest cart if user logs in
    if (user?.id) {
      const guestKey = `${CART_STORAGE_KEY}_guest`;
      const guestCart = localStorage.getItem(guestKey);
      if (guestCart) {
        console.log('🔄 Merging guest cart with user cart');
        try {
          const guestItems: CartItem[] = JSON.parse(guestCart);
          const mergedItems = [...items];
          
          guestItems.forEach(guestItem => {
            const existingIndex = mergedItems.findIndex(item => 
              item.product._id === guestItem.product._id
            );
            
            if (existingIndex >= 0) {
              // Merge quantities
              mergedItems[existingIndex].quantity += guestItem.quantity;
            } else {
              // Add new item
              mergedItems.push(guestItem);
            }
          });
          
          setItems(mergedItems);
          localStorage.removeItem(guestKey);
          console.log('✅ Guest cart merged successfully');
        } catch (error) {
          console.error('❌ Error merging guest cart:', error);
        }
      }
    }
  }, [items, user?.id, isInitialized]);

  // Calculate total number of items in cart
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate total amount
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  /**
   * Add a product to the cart
   * If product already exists, increase quantity
   */
  const addToCart = (product: Product, quantity: number = 1) => {
    console.log('🛒 Adding to cart:', product.name, 'User:', user?.id || 'guest');
    
    setItems(currentItems => {
      const productId = product._id;
      const existingItem = currentItems.find(item => 
        item.product._id === productId
      );
      
      console.log('🔍 Existing item:', existingItem ? 'Yes' : 'No');
      
      if (existingItem) {
        // Update quantity if product already in cart
        const newQuantity = existingItem.quantity + quantity;
        
        // Check stock availability
        if (newQuantity > product.stock) {
          toast({
            title: 'Stock limit reached',
            description: `Only ${product.stock} items available`,
            variant: 'destructive',
          });
          return currentItems;
        }
        
        toast({
          title: 'Cart updated',
          description: `${product.name} quantity increased to ${newQuantity}`,
        });
        
        return currentItems.map(item =>
          item.product._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      
      // Add new item to cart
      toast({
        title: 'Added to cart',
        description: `${product.name} added to your cart`,
      });
      
      return [...currentItems, { product, quantity }];
    });
  };

  /**
   * Remove a product from the cart
   */
  const removeFromCart = (productId: string) => {
    setItems(currentItems => {
      const item = currentItems.find(i => i.product._id === productId);
      
      if (item) {
        toast({
          title: 'Removed from cart',
          description: `${item.product.name} removed from your cart`,
        });
      }
      
      return currentItems.filter(item => item.product._id !== productId);
    });
  };

  /**
   * Update the quantity of a product in the cart
   */
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setItems(currentItems => {
      const item = currentItems.find(i => i.product._id === productId);
      
      if (item && quantity > item.product.stock) {
        toast({
          title: 'Stock limit reached',
          description: `Only ${item.product.stock} items available`,
          variant: 'destructive',
        });
        return currentItems;
      }
      
      return currentItems.map(item =>
        item.product._id === productId ? { ...item, quantity } : item
      );
    });
  };

  /**
   * Clear all items from the cart
   */
  const clearCart = () => {
    setItems([]);
    toast({
      title: 'Cart cleared',
      description: 'All items have been removed from your cart',
    });
  };

  /**
   * Switch to user cart (used when user logs in)
   */
  const switchToUserCart = (userId: string) => {
    console.log(`🔄 Switching to user cart for user: ${userId}`);
    // The useEffect will handle this automatically
  };

  const value: CartContextType = {
    items,
    totalItems,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Custom hook to use the cart context
 * Must be used within a CartProvider
 */
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};