import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AcceptedOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const deliveryToken = localStorage.getItem('deliveryToken');
    const deliveryData = JSON.parse(localStorage.getItem('deliveryUser')) || {};
    const deliveryBoyId = deliveryData._id || deliveryData.id;

    const fetchAcceptedOrders = async () => {
        try {
            setLoading(true);
            // Added token to headers for security
            const response = await axios.get(`http://localhost:4000/api/delivery/available?deliveryBoyId=${deliveryBoyId}`, {
                headers: { token: deliveryToken }
            });
            
            if (response.data.success) {
                // FILTER: Only show orders assigned to THIS delivery partner that are currently out
                const active = response.data.orders.filter(o => 
                    o.deliveryBoy === deliveryBoyId && 
                    o.status === 'Out for Delivery'
                );
                setOrders(active);
            }
        } catch (error) {
            console.error("Fetch active orders error:", error);
            toast.error("Error loading active tasks");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const response = await axios.post('http://localhost:4000/api/delivery/status', {
                orderId,
                status: newStatus
            }, {
                headers: { token: deliveryToken } // Ensure token is sent for status updates
            });
            
            if (response.data.success) {
                toast.success(`Order marked as ${newStatus}`);
                fetchAcceptedOrders(); 
            }
        } catch (error) {
            toast.error("Failed to update order status");
        }
    };

    // --- FIXED GOOGLE MAPS URL ---
    const openInMaps = (address) => {
        if (!address) return;
        const query = encodeURIComponent(`${address.street}, ${address.city}, ${address.state} ${address.zipcode}`);
        // Standard Google Maps URL format
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    useEffect(() => {
        if (deliveryBoyId) fetchAcceptedOrders();
    }, [deliveryBoyId]);

    if (loading) return <div className="p-10 text-center text-gray-500">Updating active tasks...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/30">
                <h3 className="text-xl font-bold text-gray-800">My Accepted Tasks</h3>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    {orders.length} Active
                </span>
            </div>

            <div className="p-6">
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400">You don't have any active deliveries.</p>
                        <p className="text-sm text-gray-400 mt-1">Go to Available Orders to pick up a new task.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                        {orders.map(order => (
                            <div key={order._id} className="border-2 border-blue-100 p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Customer Details</p>
                                        <h4 className="text-lg font-bold text-gray-900">
                                            {order.address?.firstName} {order.address?.lastName}
                                        </h4>
                                    </div>
                                    <p className="font-black text-xl text-gray-800">₹{order.amount}</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 text-gray-400">📍</div>
                                        <p className="text-sm text-gray-600">
                                            {order.address?.street}, {order.address?.city}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-gray-400">📞</div>
                                        <a href={`tel:${order.address?.phone}`} className="text-sm font-bold text-blue-600 hover:underline">
                                            {order.address?.phone}
                                        </a>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <button 
                                        onClick={() => openInMaps(order.address)}
                                        className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors mb-2"
                                    >
                                        Navigate in Maps
                                    </button>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => updateStatus(order._id, 'Delivered')}
                                            className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md active:scale-95"
                                        >
                                            Delivered
                                        </button>
                                        <button 
                                            onClick={() => updateStatus(order._id, 'Cancelled')}
                                            className="flex-[0.5] bg-white text-red-500 py-3 rounded-xl font-bold hover:bg-red-50 border border-red-100 transition-all text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcceptedOrders;