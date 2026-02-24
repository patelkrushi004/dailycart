import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'

const Orders = () => {
    const { currency, axios } = useAppContext()
    const [orders, setOrders] = useState([])

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/api/seller/order', { withCredentials: true });
            
            if (data.success) {
                setOrders(data.orders.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error("Fetch Orders Error:", error)
            toast.error(error.message)
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [])

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-10 p-4 space-y-4">
                <div className='flex flex-col items-start mb-4'>
                    <h2 className="text-lg font-medium uppercase">Orders List</h2>
                    <div className='w-16 h-0.5 bg-primary rounded-full'></div>
                </div>

                {orders.length > 0 ? (
                    orders.map((order, index) => (
                        <div key={index} className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300 bg-white shadow-sm">

                            {/* Section 1: Product Images & Names */}
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
                                <p className='text-[10px] text-gray-400 font-mono mt-1'>ID: {order._id}</p>
                            </div>

                            {/* Section 2: Shipping Address */}
                            <div className="text-sm text-black/60 border-l border-gray-100 pl-4">
                                <p className='text-black/80 font-semibold'>
                                    {order.address.firstName} {order.address.lastName}
                                </p>
                                <p className='text-xs'>{order.address.street}, {order.address.city}</p>
                                <p className='text-xs'>{order.address.state}, {order.address.zipcode}</p>
                                <p className='text-xs'>{order.address.phone}</p>
                            </div>

                            {/* Section 3: Total Amount */}
                            <div className='text-center'>
                                <p className="font-bold text-lg text-gray-800">
                                    {currency}{order.amount}
                                </p>
                                <p className='text-[10px] text-gray-400 uppercase'>{order.paymentType}</p>
                            </div>

                            {/* Section 4: Status & Date */}
                            <div className="flex flex-col items-start md:items-end text-sm min-w-[140px]">
                                <div className='flex items-center gap-2 mb-1'>
                                    <span className={`w-2 h-2 rounded-full ${order.status === 'Delivered' ? 'bg-green-500' : 'bg-orange-400'}`}></span>
                                    <p className="text-primary font-bold uppercase text-xs">
                                        {order.status}
                                    </p>
                                </div>
                                
                                <p className='text-xs text-gray-500'>
                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                                </p>
                                
                                {/* PAYMENT STATUS: Done is Green, Pending is Gray */}
                                <div className='mt-2 py-1 px-3 bg-gray-50 rounded border border-gray-100'>
                                    <p className={`text-[11px] font-bold ${order.isPaid ? 'text-green-600' : 'text-gray-500'}`}>
                                        Payment: {order.isPaid ? "DONE" : "PENDING"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-500 text-center py-20 border-2 border-dashed rounded-md max-w-4xl bg-gray-50">
                        <p>No orders found.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Orders