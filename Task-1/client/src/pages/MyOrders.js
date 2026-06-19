import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders/myorders');
      setOrders(res.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-600 mb-4">No orders yet</p>
          <Link to="/products" className="text-blue-600 hover:text-blue-800">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order #{order._id.slice(-8)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.status}
                </span>
              </div>
              
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center gap-3 py-2 border-t">
                  <img
                    src={item.product?.images?.[0] || 'https://placehold.co/50'}
                    alt={item.product?.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-grow">
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} × {item.price?.toLocaleString()} ETB</p>
                  </div>
                </div>
              ))}
              
              <div className="border-t mt-4 pt-4 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-blue-600">
                  {order.totalPrice?.toLocaleString()} ETB
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;