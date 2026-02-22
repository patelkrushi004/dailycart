import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DeliveryDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [partnerId, setPartnerId] = useState(null);
    const [token, setToken] = useState(null);

    // --- 1. AUTH SYNC ---
    useEffect(() => {
        const storedToken = localStorage.getItem('deliveryToken');
        const rawUser = localStorage.getItem('deliveryUser');
        
        if (storedToken && rawUser) {
            try {
                const parsed = JSON.parse(rawUser);
                const id = parsed._id || parsed.id;
                setPartnerId(id);
                setToken(storedToken);
            } catch (e) {
                console.error("Auth parsing error", e);
            }
        }
    }, []);

    const [hiddenOrders, setHiddenOrders] = useState(() => {
        const saved = localStorage.getItem('permanentHiddenOrders');
        return saved ? JSON.parse(saved) : [];
    });

    const fetchOrders = async () => {
        const storedToken = localStorage.getItem('deliveryToken');
        const rawUser = localStorage.getItem('deliveryUser');
        let currentId = "";
        
        if (rawUser) {
            try {
                const p = JSON.parse(rawUser);
                currentId = p._id || p.id;
            } catch (e) { console.error(e); }
        }

        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:4000/api/delivery/available`, {
                params: { deliveryBoyId: currentId },
                headers: { token: storedToken } 
            });

            if (response.data && response.data.success) {
                const available = response.data.orders.filter(order => !order.deliveryBoy);
                setOrders(available);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [partnerId]);

    // --- 2. HANDLE ACCEPT ORDER ---
    const handleAcceptOrder = async (orderId) => {
        // Logic fix: Ensure we have the latest ID/Token directly from storage
        const currentToken = token || localStorage.getItem('deliveryToken');
        const rawUser = localStorage.getItem('deliveryUser');
        let currentId = partnerId;

        if (!currentId && rawUser) {
            const parsed = JSON.parse(rawUser);
            currentId = parsed._id || parsed.id;
        }

        if (!currentId) {
            toast.error("User session not found. Please re-login.");
            return; 
        }

        try {
            const { data } = await axios.post('http://localhost:4000/api/delivery/accept', 
                { 
                    orderId: orderId, 
                    deliveryBoyId: currentId 
                },
                { headers: { token: currentToken } } 
            );

            if (data.success) {
                toast.success("Order Accepted!");
                window.scrollTo(0, 0); // Logic fix: ensure top of page view
                navigate('/delivery/orders/accepted'); 
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Order no longer available";
            toast.error(errorMessage);
            fetchOrders(); 
        }
    };

    const permanentlyHideOrder = (id) => {
        setHiddenOrders((prev) => {
            const updated = [...prev, id];
            localStorage.setItem('permanentHiddenOrders', JSON.stringify(updated));
            return updated;
        });
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Available Orders...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Available Orders</h3>
                <button onClick={fetchOrders} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    Refresh
                </button>
            </div>
            
            <div className="p-6">
                {orders.filter(order => !hiddenOrders.includes(order._id)).length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl">
                        <p className="text-gray-400">No new orders found.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {orders
                            .filter(order => !hiddenOrders.includes(order._id))
                            .map((order) => (
                                <div key={order._id} className="border border-gray-200 p-5 rounded-2xl shadow-sm hover:border-blue-300 transition-all bg-white">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-tight">Available</span>
                                        <p className="text-xl font-bold text-gray-900">₹{order.amount}</p>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                                        <p><strong>Customer:</strong> {order.address?.firstName || 'Guest'}</p>
                                        <p><strong>Location:</strong> {order.address?.city || 'Unknown'}</p>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => handleAcceptOrder(order._id)}
                                            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all active:scale-95 shadow-md shadow-green-100"
                                        >
                                            Accept Order
                                        </button>
                                        
                                        <button 
                                            onClick={() => permanentlyHideOrder(order._id)}
                                            className="w-full text-gray-400 text-xs py-1 hover:text-red-500 transition-colors"
                                        >
                                            Don't show this again
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryDashboard;