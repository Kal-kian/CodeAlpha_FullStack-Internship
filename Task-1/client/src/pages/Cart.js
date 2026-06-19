import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, cartCount, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(null);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    
    setUpdating(productId);
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    setUpdating(productId);
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <svg className="mx-auto h-24 w-24 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Please login to view your cart</h2>
        <Link
          to="/login"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Login
        </Link>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <svg className="mx-auto h-24 w-24 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some products to your cart and they will appear here</p>
        <Link
          to="/products"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cartCount} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.product?._id} className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Product Image */}
              <Link to={`/products/${item.product?._id}`} className="flex-shrink-0">
                <img
                  src={item.product?.images?.[0] || 'https://placehold.co/150x150?text=No+Image'}
                  alt={item.product?.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/150x150?text=No+Image';
                  }}
                />
              </Link>

              {/* Product Info */}
              <div className="flex-grow">
                <Link 
                  to={`/products/${item.product?._id}`}
                  className="text-lg font-semibold text-gray-800 hover:text-blue-600"
                >
                  {item.product?.name || 'Product Unavailable'}
                </Link>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    item.product?.condition === 'New' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.product?.condition}
                  </span>
                  <span className="text-sm text-gray-500">{item.product?.city}</span>
                </div>

                <p className="text-blue-600 font-bold text-xl mt-2">
                  {item.price?.toLocaleString()} ETB
                </p>

                {item.product?.quantity !== undefined && item.product?.quantity < 5 && (
                  <p className="text-red-500 text-sm mt-1">
                    Only {item.product.quantity} left in stock
                  </p>
                )}
              </div>

              {/* Quantity and Remove */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg disabled:opacity-50"
                    onClick={() => handleUpdateQuantity(item.product?._id, item.quantity - 1)}
                    disabled={updating === item.product?._id}
                  >
                    −
                  </button>
                  <span className="px-4 py-1 font-semibold min-w-[40px] text-center">
                    {updating === item.product?._id ? '...' : item.quantity}
                  </span>
                  <button
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg disabled:opacity-50"
                    onClick={() => handleUpdateQuantity(item.product?._id, item.quantity + 1)}
                    disabled={updating === item.product?._id}
                  >
                    +
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {(item.price * item.quantity).toLocaleString()} ETB
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.product?._id)}
                    className="text-red-500 hover:text-red-700 text-sm mt-1"
                    disabled={updating === item.product?._id}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="border-t border-b py-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                <span className="font-semibold">
                  {cart.totalPrice?.toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
            </div>

            <div className="flex justify-between mb-6">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                {cart.totalPrice?.toLocaleString()} ETB
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/products"
              className="block text-center mt-4 text-blue-600 hover:text-blue-800"
            >
              Continue Shopping
            </Link>

            {/* Payment Method */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Payment Method</p>
              <p className="text-sm text-gray-600">💰 Cash on Delivery (COD)</p>
              <p className="text-xs text-gray-500 mt-1">Pay when you receive your order</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;