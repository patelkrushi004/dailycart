import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const DeliveryOrders = ({ orders = [], onAcceptSuccess }) => {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);

  const handleAcceptOrder = async (orderId) => {
    try {
      setLoadingId(orderId);

      const token = localStorage.getItem("deliveryToken");
      const storedUser = localStorage.getItem("deliveryUser");

      if (!token || !storedUser) {
        toast.error("Please login again");
        navigate("/login"); 
        return;
      }

      const user = JSON.parse(storedUser);
      const deliveryBoyId = user?._id || user?.id;
      
      if (!deliveryBoyId) {
        toast.error("Delivery partner profile ID missing");
        return;
      }

      /**
       * IMPORTANT: The backend 'accept' route must now handle:
       * 1. Setting status to "Delivered"
       * 2. Setting isPaid to true
       */
      const response = await axios.post(
        "http://localhost:4000/api/delivery/accept",
        { orderId, deliveryBoyId },
        { headers: { token } }
      );

      if (response.data.success) {
        // Updated toast to reflect the full action
        toast.success("Order Delivered & Payment Received! ✅");
        
        if (onAcceptSuccess) onAcceptSuccess(orderId);
        
        // Navigate to History since the order is now finished (Delivered)
        navigate("/delivery/history"); 
      } else {
        toast.error(response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("FULL AXIOS ERROR:", error);
      toast.error(error?.response?.data?.message || "Connection error to server");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
      {orders.length === 0 ? (
        <div className="col-span-full text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">No available orders at the moment.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-blue-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-mono text-sm text-gray-700">#{order?._id?.slice(-6)}</p>
                <p className="text-xs text-gray-400">{order.paymentType || "COD"}</p>
              </div>
              <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-lg">₹{order?.amount}</span>
            </div>

            <div className="mb-4 text-sm text-gray-600">
               <p className="font-semibold text-gray-800">{order.address?.firstName} {order.address?.lastName}</p>
               <p>{order.address?.street}, {order.address?.city}</p>
            </div>

            <button
              onClick={() => handleAcceptOrder(order._id)}
              disabled={loadingId !== null}
              className={`w-full font-bold py-3 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2 ${
                loadingId === order._id
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100"
              }`}
            >
              {loadingId === order._id ? "Processing..." : "Accept & Deliver"}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default DeliveryOrders;