import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, selectedVariant?: ProductVariant, customizationNotes?: string) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  updateNotes: (index: number, notes: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string | number, size?: string) => number;
  decrementItem: (product: Product, size?: string) => void;
  incrementItem: (product: Product, selectedVariant?: ProductVariant) => void;
  totalItems: number;
  totalEstimatedPrice: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dot_art_enquiry_list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('dot_art_enquiry_list', JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = (product: Product, selectedVariant?: ProductVariant, customizationNotes?: string) => {
    const size = selectedVariant ? selectedVariant.size : product.base_size || 'Standard';
    const price = selectedVariant ? selectedVariant.price : product.base_price;

    setItems((prev) => {
      // Check if same product and size already exists
      const existingIdx = prev.findIndex((i) => i.product.id === product.id && i.size === size);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        if (customizationNotes) {
          copy[existingIdx].customization_notes = customizationNotes;
        }
        return copy;
      }
      return [
        ...prev,
        {
          product,
          selected_variant: selectedVariant,
          size,
          price,
          quantity: 1,
          customization_notes: customizationNotes || '',
        },
      ];
    });
  };

  const removeFromCart = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setItems((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index].quantity = quantity;
      }
      return copy;
    });
  };

  const updateNotes = (index: number, notes: string) => {
    setItems((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index].customization_notes = notes;
      }
      return copy;
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: string | number, size?: string) => {
    return items
      .filter((i) => i.product.id === productId && (!size || i.size === size))
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  const decrementItem = (product: Product, size?: string) => {
    const targetSize = size || product.base_size || 'Standard';
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id && i.size === targetSize);
      if (idx >= 0) {
        if (prev[idx].quantity <= 1) {
          return prev.filter((_, i) => i !== idx);
        }
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity - 1 };
        return copy;
      }
      return prev;
    });
  };

  const incrementItem = (product: Product, selectedVariant?: ProductVariant) => {
    addToCart(product, selectedVariant);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalEstimatedPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateNotes,
        clearCart,
        getItemQuantity,
        decrementItem,
        incrementItem,
        totalItems,
        totalEstimatedPrice,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
