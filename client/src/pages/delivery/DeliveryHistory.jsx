import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { assets } from '../../assets/assets';

const DeliveryHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const currency = "₹";

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('deliveryToken');
            const user = JSON.parse(localStorage.getItem('deliveryUser'));

            if (!user?._id) return;

            // Notice the URL matches the route: /api/delivery/list/:deliveryBoyId
            const { data } = await axios.get(`http://localhost:4000/api/delivery/list/${user._id}`, {
                headers: { token }
            });

            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("History fetch error", error);
            toast.error("Could not load history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    if (loading) return <div className='p-10'>Loading History...</div>;

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll bg-gray-50'>
            <div className="md:p-10 p-4 space-y-4">
                <div className='flex flex-col items-start mb-6'>
                    <h2 className="text-lg font-medium uppercase tracking-wider">Completed Deliveries</h2>
                    <div className='w-16 h-0.5 bg-green-500 rounded-full'></div>
                </div>

                {orders.length > 0 ? (
                    orders.map((order, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-5 justify-between p-5 rounded-md border border-gray-200 bg-white shadow-sm">
                            
                            {/* Product Info */}
                            <div className="flex flex-col gap-2">
                                <div className='flex items-center gap-3'>
                                    <img className="w-10" src={assets.box_icon} alt="" />
                                    <div>
                                        {order.items.map((item, idx) => (
                                            <p key={idx} className='text-sm font-medium'>
                                                {item.product?.name} x {item.quantity}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                                <p className='text-[10px] text-gray-400 font-mono'>Order ID: {order._id}</p>
                            </div>

                            {/* Customer Info */}
                            <div className='text-sm text-gray-600'>
                                <p className='font-semibold text-black'>{order.address.firstName} {order.address.lastName}</p>
                                <p className='text-xs'>{order.address.city}, {order.address.state}</p>
                            </div>

                            {/* Payment Status (Matches Seller Style) */}
                            <div className='flex flex-col items-center md:items-end gap-2'>
                                <p className='font-bold text-gray-800'>{currency}{order.amount}</p>
                                <div className='flex gap-2'>
                                    <span className='bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded font-bold uppercase'>
                                        Paid
                                    </span>
                                    <span className='bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded font-bold uppercase'>
                                        Delivered
                                    </span>
                                </div>
                                <p className='text-[10px] text-gray-400'>
                                    {new Date(order.deliveredAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='text-center py-20 bg-white rounded-md border border-dashed border-gray-300'>
                        <p className='text-gray-400'>No completed deliveries yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryHistory;