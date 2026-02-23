import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const DeliveryOrders = ({ orders = [] }) => {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);

  const handleAcceptOrder = async (orderId) => {
    console.log("ACCEPT CLICKED:", orderId);

    try {
      setLoadingId(orderId);

      const token = localStorage.getItem("deliveryToken");
      const storedUser = localStorage.getItem("deliveryUser");

      // ✅ LOGIN CHECK
      if (!token || !storedUser) {
        toast.error("Please login again");
        setLoadingId(null);
        return;
      }

      const user = JSON.parse(storedUser);
      const deliveryBoyId = user?._id || user?.id;

      if (!deliveryBoyId) {
        toast.error("Delivery partner not found");
        setLoadingId(null);
        return;
      }

      // ✅ API CALL
      const { data } = await axios.post(
        "http://localhost:4000/api/delivery/accept",
        { orderId, deliveryBoyId },
        {
          headers: { token },
        }
      );

      console.log("ACCEPT RESPONSE:", data);

      if (data.success) {
        toast.success("Order Accepted ✅");

        // ✅ ABSOLUTE PATH
        navigate("/delivery/orders/accepted");
      } else {
        toast.error(data.message || "Accept failed");
      }
    } catch (error) {
      console.error("ACCEPT ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Server error while accepting order"
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
      {orders.length === 0 ? (
        <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl">
          <p className="text-gray-500">
            No available orders at the moment.
          </p>
        </div>
      ) : (
        orders.map((order) => (
          <div
            key={order._id}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Order ID
                </h3>
                <p className="font-mono text-sm text-gray-700">
                  #{order?._id?.slice(-6)}
                </p>
              </div>

              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">
                ₹{order?.amount}
              </span>
            </div>

            <div className="space-y-2 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Customer:</strong>{" "}
                {order?.address?.firstName || "Guest"}{" "}
                {order?.address?.lastName || ""}
              </p>

              <p className="text-sm text-gray-600">
                <strong>City:</strong> {order?.address?.city || "N/A"}
              </p>
            </div>

            <button
              onClick={() => handleAcceptOrder(order._id)}
              disabled={loadingId === order._id}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition active:scale-95 disabled:opacity-50"
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