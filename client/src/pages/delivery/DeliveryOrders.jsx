import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const DeliveryOrders = ({ orders = [], onAcceptSuccess }) => {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);

  const handleAcceptOrder = async (orderId) => {
    // DEBUG LOG 1: Check if click even registers
    console.log("Button clicked for Order ID:", orderId);

    try {
      setLoadingId(orderId);

      const token = localStorage.getItem("deliveryToken");
      const storedUser = localStorage.getItem("deliveryUser");

      // DEBUG LOG 2: Check storage contents
      console.log("Auth State:", { hasToken: !!token, hasUser: !!storedUser });

      if (!token || !storedUser) {
        toast.error("Please login again");
        navigate("/login"); // Adjust this path to your actual login route
        return;
      }

      let user;
      try {
        user = JSON.parse(storedUser);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        toast.error("Session corrupted. Please re-login.");
        return;
      }

      const deliveryBoyId = user?._id || user?.id;
      
      if (!deliveryBoyId) {
        console.error("User Object found but no ID:", user);
        toast.error("Delivery partner profile ID missing");
        return;
      }

      // API Request - Ensure this URL exactly matches your server port
      const response = await axios.post(
        "http://localhost:4000/api/delivery/accept",
        { orderId, deliveryBoyId },
        { headers: { token } }
      );

      console.log("Server Response:", response.data);

      if (response.data.success) {
        toast.success("Order Accepted ✅");
        if (onAcceptSuccess) onAcceptSuccess(orderId);
        navigate("/delivery/orders/accepted");
      } else {
        toast.error(response.data.message || "Accept failed");
      }
    } catch (error) {
      console.error("FULL AXIOS ERROR:", error);
      toast.error(
        error?.response?.data?.message || "Connection error to server"
      );
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
            {/* UI Content... (Customer Name, Amount, etc) */}
            <div className="flex justify-between items-start mb-4">
                <p className="font-mono text-sm text-gray-700">#{order?._id?.slice(-6)}</p>
                <span className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-lg">₹{order?.amount}</span>
            </div>

            <button
              onClick={() => handleAcceptOrder(order._id)}
              disabled={loadingId !== null}
              className={`w-full font-bold py-3 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2 ${
                loadingId === order._id
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100"
              }`}
            >
              {loadingId === order._id ? "Accepting..." : "Accept Order"}
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default DeliveryOrders;