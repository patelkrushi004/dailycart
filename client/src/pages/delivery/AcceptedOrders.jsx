import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AcceptedOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null); // Track which button is clicked
    const navigate = useNavigate();

    // 1. Fetch Orders Logic
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('deliveryToken');
            const userData = localStorage.getItem('deliveryUser');
            
            if (!userData || !token) {
                navigate('/delivery/login');
                return;
            }

            const user = JSON.parse(userData);
            const userId = user._id;

            const { data } = await axios.get(`http://localhost:4000/api/delivery/available`, {
                params: { deliveryBoyId: userId },
                headers: { token }
            });
            
            if (data.success) {
                // Keep only orders assigned to this driver that are in 'Order Accepted' state
                const myTasks = data.orders.filter(o => {
                    const dboyId = typeof o.deliveryBoy === 'object' ? o.deliveryBoy?._id : o.deliveryBoy;
                    return o.status === "Order Accepted" && dboyId === userId;
                });
                setOrders(myTasks);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            toast.error("Failed to load active deliveries");
        } finally {
            setLoading(false);
        }
    };

    // 2. Button Action Logic (Update Status)
    const updateStatus = async (orderId, newStatus) => {
        if (updatingId) return; // Prevent double-clicks

        try {
            setUpdatingId(orderId); // Start loading state for this specific row
            const token = localStorage.getItem('deliveryToken');
            
            console.log("Attempting Update:", { orderId, status: newStatus });

            const { data } = await axios.post(`http://localhost:4000/api/delivery/update-status`, 
                { 
                    orderId: orderId, 
                    status: newStatus 
                }, 
                { 
                    headers: { token } 
                }
            );

            if (data.success) {
                toast.success(`Order marked as ${newStatus}`);
                // Remove the order from the list since it's no longer "Active"
                setOrders(prev => prev.filter(o => o._id !== orderId));
            } else {
                toast.error(data.message || "Could not update order");
            }
        } catch (error) {
            console.error("Button Error:", error.response?.data || error.message);
            toast.error("Network error: Backend might be down");
        } finally {
            setUpdatingId(null); // End loading state
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) return <div className="p-10 text-center animate-pulse">Syncing with server...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Active Deliveries</h2>
            
            {orders.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-2xl text-gray-400 bg-gray-50">
                    <p className="text-lg">No active orders right now.</p>
                    <p className="text-sm">Accepted orders from your dashboard will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white border p-5 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center transition-all hover:shadow-md">
                            <div className="mb-4 md:mb-0">
                                <p className="font-bold text-gray-900 text-lg">
                                    {order.address.firstName} {order.address.lastName}
                                </p>
                                <p className="text-sm text-gray-600">{order.address.street}, {order.address.city}</p>
                                <p className="text-blue-600 font-bold mt-2">Amount: ₹{order.amount}</p>
                            </div>
                            
                            <div className="flex gap-3 w-full md:w-auto">
                                <button 
                                    disabled={updatingId === order._id}
                                    onClick={() => updateStatus(order._id, "Delivered")}
                                    className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold text-white transition-all ${
                                        updatingId === order._id ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                >
                                    {updatingId === order._id ? "..." : "Mark Delivered"}
                                </button>
                                
                                <button 
                                    disabled={updatingId === order._id}
                                    onClick={() => updateStatus(order._id, "Cancelled")}
                                    className="px-6 py-2 rounded-lg text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AcceptedOrders;