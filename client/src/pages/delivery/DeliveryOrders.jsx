import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'

const DeliveredOrders = () => { // Renamed to match your Sidebar/App.js intent
    const { currency, axios } = useAppContext()
    const [orders, setOrders] = useState([])

    const fetchDeliveryOrders = async () => {
        try {
            // Logic Fix: Get token for authentication
            const token = localStorage.getItem('deliveryToken');
            const deliveryUser = JSON.parse(localStorage.getItem('deliveryUser'));
            const deliveryBoyId = deliveryUser?._id || deliveryUser?.id;

            const { data } = await axios.get('/api/delivery/available', { 
                params: { deliveryBoyId },
                headers: { token } 
            });
            
            if (data.success) {
                // Logic Fix: Only show orders that are actually 'Delivered' for the History page
                const history = data.orders.filter(o => 
                    o.deliveryBoy === deliveryBoyId && o.status === 'Delivered'
                );
                setOrders(history.reverse());
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error("Fetch Delivery Orders Error:", error)
            toast.error(error.message)
        }
    };

    useEffect(() => {
        fetchDeliveryOrders();
    }, [])

    return (
        /* UI and CSS remain exactly as you provided */
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
            <div className="md:p-10 p-4 space-y-4">
                <h2 className="text-lg font-medium">Delivered History</h2>
                {orders.length > 0 ? (
                    orders.map((order, index) => (
                        <div key={index} className="flex flex-col md:items-center md:flex-row gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300">

                            <div className="flex gap-5 max-w-80">
                                <img className="w-12 h-12 object-cover" src={assets.box_icon} alt="boxIcon" />
                                <div>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex flex-col">
                                            <p className="font-medium">
                                                {item.product ? item.product.name : "Product"}{" "} 
                                                <span className="text-primary">x {item.quantity}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="text-sm md:text-base text-black/60">
                                <p className='text-black/80 font-semibold'>
                                    Customer: {order.address.firstName} {order.address.lastName}
                                </p>
                                <p>{order.address.street}, {order.address.city}</p>
                                <p>{order.address.phone}</p>
                            </div>

                            <p className="font-medium text-lg my-auto">
                                {currency}{order.amount}
                            </p>

                            <div className="flex flex-col text-sm md:text-base text-black/60">
                                <p>Payment: {order.paymentType || (order.payment ? "Online" : "COD")}</p>
                                <p>Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</p>
                                
                                {/* Status logic consistent with your backend */}
                                <p className="text-green-600 font-medium">Status: {order.status}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-gray-500 text-center py-10">No delivered orders in your history yet.</div>
                )}
            </div>
        </div>
    )
}

export default DeliveredOrders;