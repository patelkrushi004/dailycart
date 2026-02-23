import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const AcceptedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const deliveryToken = localStorage.getItem("deliveryToken");
  const deliveryData =
    JSON.parse(localStorage.getItem("deliveryUser")) || {};

  const deliveryBoyId = deliveryData._id || deliveryData.id;

  // ✅ FETCH ACCEPTED ORDERS (CORRECT API)
  const fetchAcceptedOrders = async () => {
    try {
      if (!deliveryBoyId || !deliveryToken) {
        toast.error("Please login again");
        return;
      }

      setLoading(true);

      const { data } = await axios.get(
        `http://localhost:4000/api/delivery/accepted?deliveryBoyId=${deliveryBoyId}`,
        {
          headers: { token: deliveryToken },
        }
      );

      console.log("ACCEPTED API RESPONSE:", data);

      if (data.success) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Fetch accepted error:", error);
      toast.error("Error loading active tasks");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATE STATUS
  const updateStatus = async (orderId, newStatus) => {
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/delivery/status",
        {
          orderId,
          status: newStatus,
        },
        {
          headers: { token: deliveryToken },
        }
      );

      if (data.success) {
        toast.success(`Order marked as ${newStatus}`);
        fetchAcceptedOrders();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  // ✅ OPEN IN GOOGLE MAPS
  const openInMaps = (address) => {
    if (!address) return;

    const query = encodeURIComponent(
      `${address.street}, ${address.city}, ${address.state} ${address.zipcode}`
    );

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank"
    );
  };

  useEffect(() => {
    fetchAcceptedOrders();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        Loading active tasks...
      </div>
    );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* HEADER */}
      <div className="p-6 border-b flex justify-between items-center bg-blue-50">
        <h3 className="text-xl font-bold">My Accepted Tasks</h3>

        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
          {orders.length} Active
        </span>
      </div>

      <div className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            No active deliveries.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border-2 border-blue-100 p-5 rounded-2xl shadow-sm"
              >
                <h4 className="font-bold text-lg">
                  {order.address?.firstName} {order.address?.lastName}
                </h4>

                <p className="text-sm text-gray-600">
                  ₹{order.amount}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  {order.address?.street}, {order.address?.city}
                </p>

                <a
                  href={`tel:${order.address?.phone}`}
                  className="text-blue-600 text-sm font-bold"
                >
                  {order.address?.phone}
                </a>

                {/* ACTION BUTTONS */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() =>
                      updateStatus(order._id, "Delivered")
                    }
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold"
                  >
                    Delivered
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(order._id, "Cancelled")
                    }
                    className="flex-[0.6] border border-red-200 text-red-500 py-3 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <button
                  onClick={() => openInMaps(order.address)}
                  className="w-full bg-gray-100 mt-3 py-2 rounded-lg text-sm font-bold"
                >
                  Navigate in Maps
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptedOrders;