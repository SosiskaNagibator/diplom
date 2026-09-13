import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

const buildCartKey = (item) => {
  if (item.cartKey) return item.cartKey;

  const sizePart = item.size_label || item.size || '';
  let toppingsPart = '';

  if (Array.isArray(item.toppings)) {
    toppingsPart = item.toppings
      .map(t => (typeof t === 'object' ? t.id : t))
      .sort()
      .join('_');
  } else if (typeof item.toppings === 'string') {
    toppingsPart = item.toppings;
  }

  return `${item.id}-${sizePart}-${toppingsPart}`;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setCart(parsed.map(item => ({ ...item, cartKey: buildCartKey(item) })));
      } catch {
        setCart([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((pizza) => {
    const newKey = buildCartKey(pizza);
    setCart(prev => {
      const existing = prev.find(item => item.cartKey === newKey);
      if (existing) {
        return prev.map(item =>
          item.cartKey === newKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...pizza, cartKey: newKey, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((cartKey) => {
    setCart(prev => prev.filter(item => item.cartKey !== cartKey));
  }, []);

  const updateQuantity = useCallback((cartKey, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.cartKey !== cartKey));
      return;
    }
    setCart(prev => prev.map(item =>
      item.cartKey === cartKey ? { ...item, quantity } : item
    ));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const getCount = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotal,
      getCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};