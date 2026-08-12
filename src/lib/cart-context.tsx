"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  productCode: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  /** Caps how high quantity can go in the cart — mirrors current stock. */
  maxQuantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productCode: string) => void;
  updateQuantity: (productCode: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "shaash-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load any previously saved cart once, on mount. This has to be an effect
  // (not a lazy useState initializer) so server-rendered HTML always starts
  // from an empty cart and the client hydrates without a mismatch, then
  // "catches up" to localStorage right after.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time hydration from localStorage, see comment above
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Corrupt/blocked storage — start with an empty cart rather than throwing.
    }
    setHydrated(true);
  }, []);

  // Persist on every change, but not before the initial load has run
  // (otherwise we'd overwrite the saved cart with an empty array).
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productCode === item.productCode);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, existing.maxQuantity);
        return prev.map((i) =>
          i.productCode === item.productCode ? { ...i, quantity: nextQty } : i
        );
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.maxQuantity) }];
    });
  }, []);

  const removeItem = useCallback((productCode: string) => {
    setItems((prev) => prev.filter((i) => i.productCode !== productCode));
  }, []);

  const updateQuantity = useCallback((productCode: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productCode === productCode
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxQuantity)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );
  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({ items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalItems }),
    [items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
