import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [usedProducts, setUsedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [newRes, usedRes] = await Promise.all([
        axios.get('/api/products?condition=New&limit=8'),
        axios.get('/api/products?condition=Used&limit=8')
      ]);

      console.log('New products:', newRes.data);
      console.log('Used products:', usedRes.data);

      setNewProducts(newRes.data.data || []);
      setUsedProducts(usedRes.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
  { name: 'Electronics', icon: 'electronics' },
  { name: 'Men Clothing', icon: 'clothing' },
  { name: 'Women Clothing', icon: 'clothing' },
  { name: 'Shoes', icon: 'shoes' },
  { name: 'Bags', icon: 'bags' },
  { name: 'Accessories', icon: 'accessories' },
];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to EthioMarket</h1>
          <p className="text-xl md:text-2xl mb-8">
            Your trusted marketplace for new and used products in Ethiopia
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/products" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Shop Now
            </Link>
            <Link to="/register" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600">
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
<section className="py-16 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-12">Browse Categories</h2>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Link to="/products?category=Electronics" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group border border-gray-100">
        <div className="w-14 h-14 mx-auto mb-3 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Electronics</h3>
      </Link>

      <Link to="/products?category=Men Clothing" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group border border-gray-100">
        <div className="w-14 h-14 mx-auto mb-3 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
          <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Men Clothing</h3>
      </Link>

      <Link to="/products?category=Women Clothing" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group border border-gray-100">
        <div className="w-14 h-14 mx-auto mb-3 bg-pink-50 rounded-xl flex items-center justify-center group-hover:bg-pink-100 transition-colors">
          <svg className="w-7 h-7 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Women Clothing</h3>
      </Link>

      <Link to="/products?category=Shoes" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group border border-gray-100">
        <div className="w-14 h-14 mx-auto mb-3 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
          <svg className="w-7 h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Shoes</h3>
      </Link>

      <Link to="/products?category=Bags" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group border border-gray-100">
        <div className="w-14 h-14 mx-auto mb-3 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
          <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Bags</h3>
      </Link>

      <Link to="/products?category=Accessories" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group border border-gray-100">
        <div className="w-14 h-14 mx-auto mb-3 bg-teal-50 rounded-xl flex items-center justify-center group-hover:bg-teal-100 transition-colors">
          <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Accessories</h3>
      </Link>
    </div>
  </div>
</section>

      {/* New Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">New Arrivals</h2>
          {newProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No new products yet. <Link to="/register" className="text-blue-600">Be the first to sell!</Link></p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map(product => (
                <Link key={product._id} to={`/products/${product._id}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={product.images?.[0] || 'https://placehold.co/400x300?text=No+Image'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x300?text=No+Image';
                      }}
                    />
                    <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      {product.condition}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 truncate">{product.name}</h3>
                    <p className="text-2xl font-bold text-blue-600 mb-2">{product.price?.toLocaleString()} ETB</p>
                    <p className="text-sm text-gray-500">{product.city} • {product.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Used Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Used Products</h2>
          {usedProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No used products yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {usedProducts.map(product => (
                <Link key={product._id} to={`/products/${product._id}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img
                      src={product.images?.[0] || 'https://placehold.co/400x300?text=No+Image'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x300?text=No+Image';
                      }}
                    />
                    <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      {product.condition}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 truncate">{product.name}</h3>
                    <p className="text-2xl font-bold text-blue-600 mb-2">{product.price?.toLocaleString()} ETB</p>
                    <p className="text-sm text-gray-500">{product.city} • {product.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;