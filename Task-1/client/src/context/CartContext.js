import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], totalPrice: 0 });
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.get('/api/cart');
      setCart(res.data.data || { items: [], totalPrice: 0 });
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [], totalPrice: 0 });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await axios.post('/api/cart/add', { productId, quantity });
      setCart(res.data.data);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await axios.put(`/api/cart/update/${productId}`, { quantity });
      setCart(res.data.data);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await axios.delete(`/api/cart/remove/${productId}`);
      setCart(res.data.data);
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete('/api/cart/clear');
      setCart({ items: [], totalPrice: 0 });
    } catch (error) {
      console.error('Error clearing cart:', error);
      setCart({ items: [], totalPrice: 0 });
    }
  };

  const cartCount = cart.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  const value = {
    cart,
    loading,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};