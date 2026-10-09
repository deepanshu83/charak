"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchProducts, subscribeProducts } from "@/lib/productService";
import type { CartItem, Product } from "@/types";

const CART_KEY = "charak-cart-v2";

interface CartContextValue {
  items: CartItem[];
  products: Product[];
  addToCart: (productId: string, quantity?: number) => { success: boolean; message?: string };
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  removeUnavailableItems: () => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  getProduct: (productId: string) => Product | undefined;
  hydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  initialProducts = [],
}: {
  children: React.ReactNode;
  initialProducts?: Product[];
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [hydrated, setHydrated] = useState(false);

  // Sync products dynamically from Supabase database
  useEffect(() => {
    let isMounted = true;
    fetchProducts().then((p) => {
      if (isMounted && p) setProducts(p);
    });

    const unsubscribe = subscribeProducts(() => {
      fetchProducts().then((p) => {
        if (isMounted && p) setProducts(p);
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      window.localStorage.removeItem(CART_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist cart to localStorage whenever items change after initial hydration
  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const productMap = useMemo(() => {
    return new Map(products.map((p) => [p.id, p]));
  }, [products]);

  const getProduct = useCallback(
    (productId: string) => productMap.get(productId),
    [productMap]
  );

  const addToCart = useCallback(
    (productId: string, quantity = 1) => {
      const product = productMap.get(productId);
      if (!product || product.active === false) {
        return { success: false, message: "This formulation is currently unavailable for order." };
      }
      if (product.stock <= 0) {
        return { success: false, message: "This product is currently out of stock." };
      }

      let statusMessage = "";
      setItems((current) => {
        const existing = current.find((item) => item.productId === productId);
        const currentQty = existing ? existing.quantity : 0;
        const targetQty = currentQty + quantity;

        if (targetQty > product.stock) {
          statusMessage = `Only ${product.stock} units available in stock.`;
          const cappedQty = product.stock;
          if (existing) {
            return current.map((item) =>
              item.productId === productId ? { ...item, quantity: cappedQty } : item
            );
          }
          return [...current, { productId, quantity: cappedQty }];
        }

        if (existing) {
          return current.map((item) =>
            item.productId === productId ? { ...item, quantity: targetQty } : item
          );
        }
        return [...current, { productId, quantity: targetQty }];
      });

      return { success: true, message: statusMessage || undefined };
    },
    [productMap]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((current) => current.filter((item) => item.productId !== productId));
        return { success: true };
      }

      const product = productMap.get(productId);
      if (product && quantity > product.stock) {
        setItems((current) =>
          current.map((item) =>
            item.productId === productId ? { ...item, quantity: product.stock } : item
          )
        );
        return {
          success: false,
          message: `Only ${product.stock} units are currently in stock.`,
        };
      }

      setItems((current) =>
        current.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
      return { success: true };
    },
    [productMap]
  );

  const removeFromCart = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const removeUnavailableItems = useCallback(() => {
    setItems((current) =>
      current.filter((item) => {
        const product = productMap.get(item.productId);
        return product && product.stock > 0 && product.active !== false;
      })
    );
  }, [productMap]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      return sum + (product?.price ?? 0) * item.quantity;
    }, 0);
  }, [items, productMap]);

  return (
    <CartContext.Provider
      value={{
        items,
        products,
        addToCart,
        updateQuantity,
        removeFromCart,
        removeUnavailableItems,
        clearCart,
        itemCount,
        subtotal,
        getProduct,
        hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
