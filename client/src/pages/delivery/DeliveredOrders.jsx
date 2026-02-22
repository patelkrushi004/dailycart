import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DeliveryOrders = ({ orders }) => {
  const navigate = useNavigate();

  const handleAcceptOrder = async (orderId) => {
    try {
      // 1. Get data from LocalStorage
      const token = localStorage.getItem('deliveryToken'); 
      const storedUser = localStorage.getItem('deliveryUser');

      // 2. Silent Check (No Alert)
      if (!token || !storedUser) {
        console.error("Auth missing");
        return;
      }

      // 3. Parse and find the ID
      const user = JSON.parse(storedUser);
      // We check for _id (Standard) or id (Just in case)
      const deliveryBoyId = user._id || user.id;

      if (!deliveryBoyId) {
        console.error("No Partner ID found in storage");
        return;
      }

      // 4. API Call
      const response = await axios.post(
        `http://localhost:4000/api/delivery/accept`, 
        { 
          orderId: orderId, 
          deliveryBoyId: deliveryBoyId 
        }, 
        { headers: { token: token } } 
      );

      if (response.data.success) {
        toast.success("Order Accepted!");
        navigate('/delivery/orders/accepted'); 
      }
      
    } catch (error) {
      console.error("Acceptance failed:", error);
      // Only show error if it's a server message (like "Order already taken")
      const msg = error.response?.data?.message || "Failed to accept order";
      toast.error(msg);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
      {orders.length === 0 ? (
        <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No available orders at the moment.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</h3>
                    <p className="font-mono text-sm text-gray-700">#{order._id.slice(-6)}</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">
                    ₹{order.amount}
                </span>
            </div>

            <div className="space-y-2 mb-6">
                <p className="text-sm text-gray-600">
                    <strong>Customer:</strong> {order.address?.firstName} {order.address?.lastName}
                </p>
                <p className="text-sm text-gray-600">
                    <strong>City:</strong> {order.address?.city}
                </p>
            </div>

            <button 
              onClick={() => handleAcceptOrder(order._id)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors active:scale-95"
            >
              Accept Order
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default DeliveryOrders;