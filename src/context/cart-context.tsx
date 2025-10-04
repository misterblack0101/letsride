"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '@/lib/models/Product';
import { useToast } from "@/hooks/use-toast";

export type CartStorageItem = {
  slug: string;
  quantity: number;
};

export type CartItem = Product & { quantity: number };

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: Product, quantity?: number) => void;
  removeItem: (itemSlug: string) => void;
  updateQuantity: (itemSlug: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slugs: items.map(item => item.slug) }),
          });

          if (!response.ok) throw new Error('Failed to fetch cart data');

          const products: Product[] = await response.json();
          const res: CartItem[] = products.map((product, i) => ({
            ...product,
            quantity: items[i].quantity,
          }));
          setCartItems(res.filter(Boolean));
        }
      } catch {
        // silently fail
      }
    }
    loadCart();
  }, []);

  useEffect(() => {
    try {
      const storageItems: CartStorageItem[] = cartItems.map(item => ({
        slug: item.slug,
        quantity: item.quantity,
      }));
      localStorage.setItem('cart', JSON.stringify(storageItems));
    } catch {
      // silently fail
    }
  }, [cartItems]);

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

  const removeItem = (itemSlug: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.slug !== itemSlug));
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    });
  };

  const updateQuantity = (itemSlug: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemSlug);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.slug === itemSlug ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.price ?? 0) * item.quantity,
    0
  );

  const itemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
