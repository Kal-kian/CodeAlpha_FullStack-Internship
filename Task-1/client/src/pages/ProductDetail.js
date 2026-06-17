import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/products/${id}`);
      console.log('Product data:', res.data);
      setProduct(res.data.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    addToCart(product._id, quantity)
      .then(() => {
      })
      .catch((error) => {
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-600">Product not found</h2>
        <Link to="/products" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/" className="text-gray-500 hover:text-blue-600">Home</Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link to="/products" className="text-gray-500 hover:text-blue-600">Products</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left - Product Images */}
        <div>
          {/* Main Image */}
          <div className="bg-white rounded-lg overflow-hidden shadow-md mb-4">
            <img
              src={product.images?.[selectedImage] || 'https://via.placeholder.com/600x600?text=No+Image'}
              alt={product.name}
              className="w-full h-96 object-contain"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
              }}
            />
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={`w-full h-20 object-cover rounded cursor-pointer border-2 transition-all ${
                    selectedImage === index 
                      ? 'border-blue-600 opacity-100' 
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  onClick={() => setSelectedImage(index)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right - Product Info */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Condition Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                product.condition === 'New' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {product.condition}
              </span>
              <span className="text-sm text-gray-500">{product.category}</span>
            </div>

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {/* Price */}
            <p className="text-4xl font-bold text-blue-600 mb-6">
              {product.price?.toLocaleString()} ETB
            </p>

            {/* Location */}
            <div className="flex items-center text-gray-600 mb-4">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{product.city}</span>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.quantity > 0 ? (
                <span className="text-green-600 font-medium">
                  ✓ {product.quantity} in stock
                </span>
              ) : (
                <span className="text-red-600 font-medium">✗ Out of stock</span>
              )}
            </div>

            {/* Add to Cart Section */}
            {product.quantity > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <button
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                >
                  Add to Cart
                </button>
              </div>
            )}

            {/* Seller Info */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-3">Seller Information</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{product.seller?.name || 'Unknown Seller'}</p>
                  <p className="text-sm text-gray-500">{product.seller?.city || ''}</p>
                  {product.seller?.phone && (
                    <p className="text-sm text-gray-500">{product.seller.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-4">
            <h3 className="text-lg font-semibold mb-4">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-4">
              <h3 className="text-lg font-semibold mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="border-b pb-2">
                    <span className="text-sm text-gray-500">{key}</span>
                    <p className="font-medium text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;