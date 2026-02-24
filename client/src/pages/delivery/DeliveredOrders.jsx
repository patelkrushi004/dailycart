import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { assets } from '../../assets/assets'; 

const DeliveredOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
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
                setOrders(data.orders);
            }
        } catch (error) {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    // UPDATED: Pure status update without history tracking
    const handleAcceptAndDeliver = async (orderId) => {
        try {
            const token = localStorage.getItem('deliveryToken');

            // Send only the orderId to update status for Customer & Seller
            const { data } = await axios.post(`http://localhost:4000/api/delivery/accept-order`, 
                { orderId }, 
                { headers: { token } }
            );

            if (data.success) {
                toast.success("Order status updated! ✅");
                
                // Refresh the current list so the order disappears from pending
                fetchOrders(); 
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    if (loading) return <div className='p-10 text-center font-medium'>Loading...</div>;

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-10 p-4 space-y-4">
                <h2 className="text-lg font-medium uppercase">Pending Deliveries</h2>
                <div className='w-16 h-0.5 bg-primary rounded-full mb-6'></div>
                
                {orders.length > 0 ? (
                    orders.map((order, index) => (
                        <div key={index} className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300 bg-white shadow-sm">
                            <div className="flex flex-col gap-3 min-w-[280px]">
                                {order.items && order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <img className="w-12 h-12 object-cover rounded bg-gray-100" src={item.product?.image?.[0] || assets.box_icon} alt="" />
                                        <div>
                                            <p className="font-medium text-sm leading-tight">{item.product?.name}</p>
                                            <p className='text-xs text-primary font-bold'>x {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm text-black/60 border-l border-gray-100 pl-4">
                                <p className='text-black/80 font-semibold'>{order.address?.firstName} {order.address?.lastName}</p>
                                <p className='text-xs'>{order.address?.street}, {order.address?.city}</p>
                                <p className='text-xs font-medium text-primary mt-1'>{order.address?.phone}</p>
                            </div>
                            <div className='text-center'>
                                <p className="font-bold text-lg text-gray-800">{currency}{order.amount}</p>
                                <p className='text-[10px] text-gray-400 uppercase font-bold'>{order.paymentType}</p>
                            </div>
                            <div className="flex flex-col items-end min-w-[150px]">
                                <button 
                                    onClick={() => handleAcceptAndDeliver(order._id)}
                                    className="w-full bg-primary text-white text-xs px-4 py-2.5 rounded shadow-sm hover:bg-black transition-all uppercase font-bold"
                                >
                                    Confirm Delivery
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className='text-center text-gray-500 py-10'>No pending orders.</p>
                )}
            </div>
        </div>
    );
}

export default DeliveredOrders;