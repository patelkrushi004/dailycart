import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DeliveryDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    // Persistent hidden orders logic
    const [hiddenOrders, setHiddenOrders] = useState(() => {
        const saved = localStorage.getItem('permanentHiddenOrders');
        return saved ? JSON.parse(saved) : [];
    });

    const getAuth = () => {
        const token = localStorage.getItem('deliveryToken');
        const rawUser = localStorage.getItem('deliveryUser');
        let user = null;
        try { user = rawUser ? JSON.parse(rawUser) : null; } catch (e) { console.error(e); }
        return { token, userId: user?._id };
    };

    const fetchOrders = async () => {
        const { token, userId } = getAuth();
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:4000/api/delivery/available`, {
                params: { deliveryBoyId: userId },
                headers: { token } 
            });
            if (response.data?.success) {
                // Filter for "Order Placed" status
                setOrders(response.data.orders.filter(order => order.status === "Order Placed"));
            }
        } catch (error) {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleAcceptOrder = async (orderId) => {
        const { token, userId } = getAuth();

        if (!token || !userId) {
            toast.error("Session expired. Please login again.");
            navigate('/delivery/login');
            return;
        }

        if (processingId) return;

        try {
            setProcessingId(orderId);
            const response = await axios.post('http://localhost:4000/api/delivery/accept-order', 
                { orderId, deliveryBoyId: userId },
                { headers: { token } } 
            );

            if (response.data.success) {
                toast.success("Order Accepted! ✅");
                navigate('/delivery/delivered'); 
            } else {
                toast.error(response.data.message || "Failed to accept");
            }
        } catch (error) {
            toast.error("Server connection failed");
        } finally {
            setProcessingId(null);
        }
    };

    const permanentlyHideOrder = (id) => {
        setHiddenOrders((prev) => {
            const updated = [...prev, id];
            localStorage.setItem('permanentHiddenOrders', JSON.stringify(updated));
            return updated;
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-gray-500 font-medium animate-pulse">Scanning for Orders...</div>
        </div>
    );

    const visibleOrders = orders.filter(order => !hiddenOrders.includes(order._id));

    return (
        <div className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="text-xl font-bold text-gray-800">Available Orders</h3>
                    <button onClick={fetchOrders} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all active:scale-95">
                        Refresh
                    </button>
                </div>
                <div className="p-6">
                    {visibleOrders.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium">No new orders found at this time.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {visibleOrders.map((order) => (
                                <div key={order._id} className="border border-gray-200 p-5 rounded-2xl shadow-sm bg-white hover:border-blue-300 transition-colors">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase">New Order</span>
                                        <p className="text-2xl font-black text-gray-900">₹{order.amount}</p>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                                        <p><span className="font-bold text-gray-800">Customer:</span> {order.address?.firstName || 'Guest'} {order.address?.lastName || ''}</p>
                                        <p><span className="font-bold text-gray-800">City:</span> {order.address?.city || 'Unknown'}</p>
                                        <p className="line-clamp-1"><span className="font-bold text-gray-800">Address:</span> {order.address?.street}</p>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            disabled={processingId === order._id}
                                            onClick={() => handleAcceptOrder(order._id)}
                                            className={`w-full font-bold py-3 rounded-xl transition-all flex justify-center items-center shadow-lg active:scale-[0.98] ${
                                                processingId === order._id ? 'bg-gray-300 text-gray-500' : 'bg-green-600 hover:bg-green-700 text-white'
                                            }`}
                                        >
                                            {processingId === order._id ? 'Accepting...' : 'Accept Order'}
                                        </button>
                                        <button onClick={() => permanentlyHideOrder(order._id)} className="w-full text-gray-400 text-xs font-medium py-1 hover:text-red-500 transition-colors">
                                            Not interested (Hide)
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;