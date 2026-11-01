'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CartItem {
  part_id: string;
  part_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  image_url?: string | null;
  stock_quantity?: number | null;
  condition?: string | null;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (partId: string, quantity: number) => void;
  removeItem: (partId: string) => void;
  clearCart: () => void;
}

const STORAGE_KEY = 'al-waha-parts-cart-v1';
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
      if (Array.isArray(stored)) setItems(stored);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.unit_price * item.quantity, 0),
    addItem: (item, quantity = 1) => setItems((current) => {
      const existing = current.find((entry) => entry.part_id === item.part_id);
      if (existing) {
        return current.map((entry) => entry.part_id === item.part_id
          ? { ...entry, quantity: Math.min(entry.quantity + quantity, entry.stock_quantity || 99) }
          : entry);
      }
      return [...current, { ...item, quantity: Math.max(1, Math.min(quantity, item.stock_quantity || 99)) }];
    }),
    updateQuantity: (partId, quantity) => setItems((current) => current
      .map((item) => item.part_id === partId
        ? { ...item, quantity: Math.max(0, Math.min(Math.floor(quantity), item.stock_quantity || 99)) }
        : item)
      .filter((item) => item.quantity > 0)),
    removeItem: (partId) => setItems((current) => current.filter((item) => item.part_id !== partId)),
    clearCart: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
}
