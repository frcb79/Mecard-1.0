import { useState, useMemo } from "react";

/* =========
   Tipos
=========== */

export type Student = {
  id: string;
  name: string;
  balance: number;
};

export type Product = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

/* =========
   Hook
=========== */

export function usePos() {
  const [student, setStudent] = useState<Student | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  /* ========
     Acciones
  ========= */

  const selectStudent = (student: Student) => {
    setStudent(student);
    setCartItems([]); // reset carrito al cambiar estudiante
  };

  const addProduct = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeProduct = (productId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.product.id !== productId)
    );
  };

  const clearSale = () => {
    setCartItems([]);
    setStudent(null);
  };

  /* =========
     Cálculos
  ========= */

  const total = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [cartItems]);

  const canPay =
    student !== null &&
    cartItems.length > 0 &&
    total <= student.balance;

  return {
    student,
    cartItems,
    total,
    canPay,
    selectStudent,
    addProduct,
    removeProduct,
    clearSale,
  };
}

