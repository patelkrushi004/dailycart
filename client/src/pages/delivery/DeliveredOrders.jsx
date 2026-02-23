import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { assets } from '../../assets/assets'; 

const DeliveredOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hiddenOrders, setHiddenOrders] = useState([]); // Local state for "Hide"
    const currency = "₹"; 

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('deliveryToken');
            const user = JSON.parse(localStorage.getItem('deliveryUser'));
            
            const { data } = await axios.get(`http://localhost:4000/api/delivery/available`, {
                params: { deliveryBoyId: user?._id },
                headers: { token }
            });

            if (data.success) {
                // Reverse matches your seller UI logic
                setOrders(data.orders.reverse());
            }
        } catch (error) {
            console.error("Fetch error", error);
            toast.error("Failed to load delivery list");
        } finally {
            setLoading(false);
        }
    };

    const markAsDelivered = async (orderId) => {
        try {
            const token = localStorage.getItem('deliveryToken');
            const { data } = await axios.post(`http://localhost:4000/api/delivery/update-status`, 
                { orderId, status: "Delivered" }, 
                { headers: { token } }
            );
            if (data.success) {
                toast.success("Order Delivered! ✅");
                fetchOrders();
            }
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    // PERMANENT REMOVE (Backend)
    const removeOrderFromHistory = async (orderId) => {
        if (!window.confirm("Permanently remove this record from your history?")) return;
        try {
            const token = localStorage.getItem('deliveryToken');
            const { data } = await axios.post(`http://localhost:4000/api/delivery/clear-history`, 
                { orderId }, 
                { headers: { token } }
            );
            if (data.success) {
                toast.success("Removed from view");
                setOrders(prev => prev.filter(order => order._id !== orderId));
            }
        } catch (error) {
            toast.error("Failed to remove record");
        }
    };

    // TEMPORARY HIDE (UI Only)
    const hideOrder = (orderId) => {
        setHiddenOrders(prev => [...prev, orderId]);
        toast.success("Order hidden");
    };

    useEffect(() => { 
        fetchOrders(); 
    }, []);

    // Filter out hidden orders before rendering
    const visibleOrders = orders.filter(order => !hiddenOrders.includes(order._id));

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-10 p-4 space-y-4">
                <div className='flex justify-between items-center max-w-4xl'>
                    <h2 className="text-lg font-medium">Delivery Management</h2>
                    {hiddenOrders.length > 0 && (
                        <button 
                            onClick={() => setHiddenOrders([])}
                            className='text-xs text-blue-600 hover:underline'
                        >
                            Show All Hidden
                        </button>
                    )}
                </div>
                
                {visibleOrders.length > 0 ? (
                    visibleOrders.map((order, index) => (
                        <div key={index} className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300 relative group">

                            {/* Section 1: Icon & Items */}
                            <div className="flex gap-5 max-w-80">
                                <img className="w-12 h-12 object-cover" src={assets.box_icon} alt="boxIcon" />
                                <div>
                                    {order.items && order.items.map((item, idx) => (
                                        <div key={idx} className="flex flex-col">
                                            <p className="font-medium">
                                                {item.product ? item.product.name : "Product"}{" "} 
                                                <span className="text-primary">x {item.quantity}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section 2: Address Info */}
                            <div className="text-sm md:text-base text-black/60">
                                <p className='text-black/80 font-semibold'>
                                    {order.address?.firstName} {order.address?.lastName}
                                </p>
                                <p>{order.address?.street}, {order.address?.city}</p>
                                <p>{order.address?.phone}</p>
                            </div>

                            {/* Section 3: Amount */}
                            <p className="font-medium text-lg my-auto">
                                {currency}{order.amount}
                            </p>

                            {/* Section 4: Status & Actions */}
                            <div className="flex flex-col text-sm md:text-base text-black/60 min-w-[150px]">
                                <p>Method: {order.paymentType || "COD"}</p>
                                <p>Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</p>
                                <p className="text-primary font-medium mb-2">Status: {order.status}</p>

                                <div className='flex flex-wrap gap-2 mt-1'>
                                    {order.status === "Order Accepted" && (
                                        <button 
                                            onClick={() => markAsDelivered(order._id)}
                                            className="bg-primary text-white text-[10px] px-3 py-2 rounded-sm hover:opacity-90 transition-all uppercase font-bold"
                                        >
                                            Mark Delivered
                                        </button>
                                    )}

                                    {order.status === "Delivered" ? (
                                        <button 
                                            onClick={() => removeOrderFromHistory(order._id)}
                                            className="border border-red-500 text-red-500 text-[10px] px-3 py-2 rounded-sm hover:bg-red-50 transition-all uppercase font-bold"
                                        >
                                            Delete Record
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => hideOrder(order._id)}
                                            className="border border-gray-400 text-gray-500 text-[10px] px-3 py-2 rounded-sm hover:bg-gray-50 transition-all uppercase font-bold"
                                        >
                                            Hide
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-500 text-center py-20 border border-dashed rounded-md max-w-4xl">
                        No delivery tasks found.
                    </div>
                )}
            </div>
        </div>
    );
}

export default DeliveredOrders;