"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import Toast from "@/components/Toast";

export interface CartItem {
  id: string;
  tempId: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  observacao?: string;
  opcao?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (tempId: string) => void;
  increaseItem: (tempId: string) => void;
  decreaseItem: (tempId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("ama-brownie-cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Erro ao carregar carrinho", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ama-brownie-cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existingItemIndex = prev.findIndex(item =>
        item.id === newItem.id &&
        item.opcao === newItem.opcao &&
        item.observacao === newItem.observacao
      );

      if (existingItemIndex > -1) {
        const newItems = [...prev];

        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + newItem.quantity
        };

        return newItems;
      }

      return [...prev, newItem];
    });

    setToastMessage(`${newItem.quantity}x ${newItem.name} adicionado!`);
    setShowToast(true);

  };

  const removeFromCart = (tempId: string) => {
    setItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const increaseItem = (tempId: string) => {
    setItems((prev) =>
      prev.map(item =>
        item.tempId === tempId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseItem = (tempId: string) => {
    setItems((prev) => {
      return prev.map(item => {
        if (item.tempId === tempId) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("ama-brownie-cart");
    setToastMessage("Carrinho limpo com sucesso!");
  };

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      increaseItem,
      decreaseItem,
      cartTotal,
      cartCount,
      clearCart,
      isSidebarOpen,
      openSidebar: () => setIsSidebarOpen(true),
      closeSidebar: () => setIsSidebarOpen(false)
    }}>
      {children}

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de um CartProvider");
  return context;
};