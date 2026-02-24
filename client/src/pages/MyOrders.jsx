import React, { useEffect, useState } from 'react'
// FIXED: Path changed from '../../' to '../' to correctly locate the context folder
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'

const MyOrders = () => {
    const { currency, axios, user } = useAppContext()
    const [myOrders, setMyOrders] = useState([])

    const fetchMyOrders = async () => {
        try {
            const { data } = await axios.get('/api/order/user')
            if (data.success) {
                // reverse to show newest orders first (Matches Seller UI)
                setMyOrders(data.orders.reverse())
            }
        } catch (error) {
            console.error("Fetch My Orders Error:", error)
        }
    }

    useEffect(() => {
        if (user) {
            fetchMyOrders()
        }
    }, [user])

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-10 p-4 space-y-4">
                <h2 className="text-lg font-medium">My Orders</h2>
                
                {myOrders.length > 0 ? (
                    myOrders.map((order, index) => (
                        <div key={index} className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300 bg-white">

                            {/* Section 1: Product Image and Name (Individual Items) */}
                            <div className="flex flex-col gap-4 min-w-[300px]">
                                {order.items && order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <img 
                                            className="w-16 h-16 object-cover rounded border border-gray-100" 
                                            src={item.product?.image?.[0] || assets.box_icon} 
                                            alt="product" 
                                        />
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {item.product ? item.product.name : "Product Unavailable"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Quantity: <span className="text-primary font-bold">{item.quantity}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Section 2: Address (Matches Seller UI Structure) */}
                            <div className="text-sm md:text-base text-black/60">
                                <p className='text-black/80 font-semibold'>
                                    {order.address?.firstName} {order.address?.lastName}
                                </p>
                                <p>{order.address?.street}, {order.address?.city}</p>
                                <p>{order.address?.phone}</p>
                                <p className='text-[10px] font-mono text-gray-400 mt-1 uppercase'>ID: {order._id}</p>
                            </div>

                            {/* Section 3: Amount */}
                            <p className="font-medium text-lg my-auto">
                                {currency}{order.amount}
                            </p>

                            {/* Section 4: Order Info & Status */}
                            <div className="flex flex-col text-sm md:text-base text-black/60">
                                <p>Method: {order.paymentType || "COD"}</p>
                                <p>Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</p>
                                
                                <div className='flex items-center gap-2 mt-1'>
                                    {/* Green dot for Delivered, Orange for others */}
                                    <span className={`w-2 h-2 rounded-full ${order.status === 'Delivered' ? 'bg-green-500' : 'bg-orange-400'}`}></span>
                                    <p className="text-primary font-medium">Status: {order.status}</p>
                                </div>
                                <p className='text-xs mt-1'>{order.isPaid ? "Payment Successful" : "Payment Pending"}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-500 text-center py-20 border border-dashed rounded-md max-w-4xl bg-gray-50">
                        <p>You have not placed any orders yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyOrders