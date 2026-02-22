import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CancelledOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const deliveryData = JSON.parse(localStorage.getItem('deliveryUser')) || {};
    const deliveryBoyId = deliveryData._id;

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:4000/api/delivery/list/${deliveryBoyId}`);
                if (response.data.success) {
                    const cancelled = response.data.orders.filter(order => order.status === "Cancelled");
                    setOrders(cancelled);
                }
            } catch (error) {
                console.error("Error fetching cancelled history", error);
            } finally {
                setLoading(false);
            }
        };
        if (deliveryBoyId) fetchHistory();
    }, [deliveryBoyId]);

    if (loading) return <div className="p-10 text-center">Loading history...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Cancelled Orders</h3>
            {orders.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-gray-400">No cancelled orders found.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.map(order => (
                        <div key={order._id} className="border border-red-100 p-4 rounded-lg bg-red-50/30 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-800">Order ID: #{order._id.slice(-6)}</p>
                                <p className="text-sm text-gray-600">Customer: {order.address?.firstName} {order.address?.lastName}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-red-600">₹{order.amount}</p>
                                <p className="text-xs text-red-400">Cancelled</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CancelledOrders;