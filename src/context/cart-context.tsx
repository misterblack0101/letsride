"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '@/lib/models/Product';
import { useToast } from "@/hooks/use-toast";

/**
 * Cart item type extending Product with quantity information.
 * 
 * @interface CartItem
 */
/**
 * Cart item stored in localStorage: only slug and quantity
 */
export type CartStorageItem = {
  slug: string;
  quantity: number;
};

/**
 * Cart item in context: full product data + quantity
 */
export type CartItem = Product & { quantity: number };

/**
 * Cart context interface defining all cart operations and state.
 * 
 * @interface CartContextType
 */
interface CartContextType {
  /** Array of items currently in the cart */
  cartItems: CartItem[];
  /** 
   * Add a product to the cart or increase quantity if it already exists.
   * @param item - Product to add
   * @param quantity - Number of units to add (default: 1)
   */
  addItem: (item: Product, quantity?: number) => void;
  /** 
   * Remove an item completely from the cart regardless of quantity.
   * @param itemId - Product ID to remove
   */
  removeItem: (itemId: string) => void;
  /** 
   * Update the quantity of an item in the cart.
   * If quantity is 0 or negative, item is removed.
   * @param itemId - Product ID to update
   * @param quantity - New quantity (removes item if <= 0)
   */
  updateQuantity: (itemId: string, quantity: number) => void;
  /** Remove all items from the cart */
  clearCart: () => void;
  /** Total price of all items in cart (price * quantity summed) */
  cartTotal: number;
  /** Total number of individual items in cart (quantities summed) */
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Cart Provider component that manages shopping cart state and persistence.
 * 
 * Provides cart functionality including:
 * - Add/remove/update items
 * - localStorage persistence across sessions
 * - Real-time cart total and item count calculation
 * - Toast notifications for user feedback
 * 
 * **Implementation Notes:**
 * - Cart data is persisted to localStorage on every change
 * - Cart is restored from localStorage on initial load
 * - Price calculations use the `price` field (not `discountedPrice`)
 * - Graceful error handling for localStorage operations
 * 
 * @param children - React components that need access to cart context
 * 
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <CartProvider>
 *       <YourComponents />
 *     </CartProvider>
 *   );
 * }
 * ```
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // Store only slug/quantity in localStorage
  const { toast } = useToast();

  useEffect(() => {
    async function loadCart() {
      try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          const items: CartStorageItem[] = JSON.parse(storedCart);
          if (!items.length) {
            setCartItems([]);
            return;
          }
          // Fetch all products in parallel using /api/cart
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ slugs: items.map(item => item.slug) }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch cart data');
          }

          const products: Product[] = await response.json();
          // Merge quantity
          const res: CartItem[] = products.map((product, i) => ({
            ...product,
            quantity: items[i].quantity,
          }));
          setCartItems(res.filter(Boolean));
        }
      } catch (error) {
        console.error("Failed to parse or fetch cart from localStorage", error);
      }
    }
    loadCart();
  }, []);

  useEffect(() => {
    try {
      // Store only slug and quantity
      const storageItems: CartStorageItem[] = cartItems.map(item => ({ slug: item.slug, quantity: item.quantity }));
      localStorage.setItem('cart', JSON.stringify(storageItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems]);

  /**
   * Adds a product to the cart or increases quantity if already present.
   * 
   * **Business Logic:**
   * - If product exists in cart: increases quantity by specified amount
   * - If product is new: adds with specified quantity
   * - Shows success toast notification to user
   * - Automatically persists to localStorage
   * 
   * @param item - Product to add to cart
   * @param quantity - Number of units to add (default: 1, must be positive)
   */
  const addItem = (item: Product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.slug === item.slug);
      if (existingItem) {
        return prevItems.map(i =>
          i.slug === item.slug ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prevItems, { ...item, quantity }];
    });
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  /**
   * Removes an item completely from the cart regardless of quantity.
   * 
   * @param itemId - Product ID to remove from cart
   */
  const removeItem = (itemSlug: string) => {
    console.log("Attempting to remove item with slug:", itemSlug);
    setCartItems(prevItems => {
      console.log("Current cart items:", prevItems);
      const updatedItems = prevItems.filter(item => {
        console.log("Comparing item slug:", item.slug, "with", itemSlug);
        return item.slug !== itemSlug;
      });
      console.log("Updated cart items after removal:", updatedItems);
      return updatedItems;
    });
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    });
  };

  /**
   * Updates the quantity of an existing cart item.
   * 
   * **Business Logic:**
   * - If quantity <= 0: removes item from cart entirely
   * - If quantity > 0: updates to new quantity
   * - No toast notification (used for quantity controls)
   * 
   * @param itemId - Product ID to update
   * @param quantity - New quantity (item removed if <= 0)
   */
  const updateQuantity = (itemSlug: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemSlug);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item => (item.slug === itemSlug ? { ...item, quantity } : item))
      );
    }
  };

  /**
   * Clears all items from the cart.
   * Used for checkout completion or cart reset functionality.
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /** 
   * Calculate total cart value.
   * **Formula**: sum of (item.price * item.quantity) for all cart items
   * **Note**: Uses `price` field, not `discountedPrice`
   * **Implementation Note**: If item.price is undefined, treat as 0 for calculation.
   */
  const cartTotal = cartItems.reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0);

  /** 
   * Calculate total number of items in cart.
   * **Formula**: sum of all item quantities
   */
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addItem, removeItem, updateQuantity, clearCart, cartTotal, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook to access cart context and operations.
 * 
 * Must be used within a CartProvider component tree.
 * Provides access to cart state and all cart operations.
 * 
 * @returns CartContextType with cart state and operations
 * @throws {Error} When used outside of CartProvider
 * 
 * @example
 * ```tsx
 * function ProductCard({ product }) {
 *   const { addItem, cartItems } = useCart();
 *   
 *   const handleAddToCart = () => {
 *     addItem(product, 1);
 *   };
 *   
 *   const isInCart = cartItems.some(item => item.id === product.id);
 *   
 *   return (
 *     <button onClick={handleAddToCart}>
 *       {isInCart ? 'In Cart' : 'Add to Cart'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
