import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link to={`/products/${product._id}`}>
        <div className="relative">
          <img
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
          <span className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold ${
            product.condition === 'New' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {product.condition}
          </span>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <p className="text-2xl font-bold text-ethio-primary mb-2">
            {product.price.toLocaleString()} ETB
          </p>
          
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <FiMapPin className="mr-1" />
            <span>{product.city}</span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;