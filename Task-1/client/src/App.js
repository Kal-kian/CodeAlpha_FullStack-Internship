import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import SellerDashboard from './pages/seller/SellerDashboard';
import AddProduct from './pages/seller/AddProduct';
import SellerOrders from './pages/seller/SellerOrders';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                
                {/* Protected Routes - Buyer */}
                <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                <Route path="/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                
                {/* Protected Routes - Seller */}
                <Route path="/seller/dashboard" element={<PrivateRoute><SellerDashboard /></PrivateRoute>} />
                <Route path="/seller/add-product" element={<PrivateRoute><AddProduct /></PrivateRoute>} />
                <Route path="/seller/edit-product/:id" element={<PrivateRoute><AddProduct /></PrivateRoute>} />
                <Route path="/seller/orders" element={<PrivateRoute><SellerOrders /></PrivateRoute>} />
                
                {/* Protected Routes - Admin */}
                <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
              </Routes>
            </main>
            <Footer />
          </div>
          
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;