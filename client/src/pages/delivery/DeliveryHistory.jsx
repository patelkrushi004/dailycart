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

            // Fetching from the delivery history endpoint
            const { data } = await axios.get(`http://localhost:4000/api/delivery/list/${user._id}`, {
                headers: { token }
            });

            if (data.success) {
                // Reverse to show the most recent delivery at the top
                setOrders(data.orders.reverse());
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

    if (loading) return <div className='p-10 text-center font-medium'>Loading History...</div>;

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll bg-white'>
            <div className="md:p-10 p-4 space-y-4">
                <div className='flex flex-col items-start mb-4'>
                    <h2 className="text-lg font-medium uppercase tracking-wider">Completed Deliveries</h2>
                    <div className='w-16 h-0.5 bg-green-500 rounded-full'></div>
                </div>

                {orders.length > 0 ? (
                    orders.map((order, index) => (
                        <div key={index} className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300 bg-white shadow-sm">

                            {/* Section 1: Product Images & Names (Mirroring Seller) */}
                            <div className="flex flex-col gap-3 min-w-[280px]">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <div className='bg-gray-100 p-1 rounded-md'>
                                            <img 
                                                className="w-12 h-12 object-cover rounded" 
                                                src={item.product?.image?.[0] || assets.box_icon} 
                                                alt="product" 
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm leading-tight">
                                                {item.product ? item.product.name : "Deleted Product"}
                                            </p>
                                            <p className='text-xs text-primary font-bold'>
                                                x {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <p className='text-[10px] text-gray-400 font-mono mt-1'>Order ID: {order._id}</p>
                            </div>

                            {/* Section 2: Customer Address */}
                            <div className="text-sm text-black/60 border-l border-gray-100 pl-4">
                                <p className='text-black/80 font-semibold'>
                                    {order.address.firstName} {order.address.lastName}
                                </p>
                                <p className='text-xs'>{order.address.street}, {order.address.city}</p>
                                <p className='text-xs'>{order.address.state}, {order.address.zipcode}</p>
                                <p className='text-xs text-primary font-medium'>{order.address.phone}</p>
                            </div>

                            {/* Section 3: Total Amount */}
                            <div className='text-center'>
                                <p className="font-bold text-lg text-gray-800">
                                    {currency}{order.amount}
                                </p>
                                <p className='text-[10px] text-gray-400 uppercase font-bold'>{order.paymentType}</p>
                            </div>

                            {/* Section 4: Delivery Status & Date */}
                            <div className="flex flex-col items-start md:items-end text-sm min-w-[140px]">
                                <div className='flex items-center gap-2 mb-1'>
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    <p className="text-green-600 font-bold uppercase text-xs">
                                        DELIVERED
                                    </p>
                                </div>
                                
                                <p className='text-xs text-gray-500'>
                                    {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : "Date N/A"}
                                </p>
                                
                                <div className='mt-2 py-1 px-3 bg-green-50 rounded border border-green-100'>
                                    <p className='text-[11px] font-bold text-green-700'>
                                        Payment: {order.isPaid ? "RECEIVED" : "PENDING"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-500 text-center py-20 border-2 border-dashed rounded-md max-w-4xl bg-gray-50">
                        <p>No completed deliveries found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryHistory;