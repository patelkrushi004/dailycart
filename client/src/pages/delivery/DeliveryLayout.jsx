import React from 'react';
import { Link, NavLink, Outlet, Navigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";

const DeliveryLayout = () => {
    // 1. SECURITY CHECK - Matches the path in App.js
    const token = localStorage.getItem('deliveryToken');
    if (!token) {
        // Redirect to /delivery/login specifically
        return <Navigate to="/delivery/login" replace />;
    }

    // 2. SIDEBAR LINKS (Matching your App.js routes)
    const sidebarLinks = [
        { 
            name: "Available Orders", 
            path: "/delivery/dashboard", // Pointing to the main dashboard
            icon: assets.order_icon 
        },
        { 
            name: "Accepted Tasks", 
            path: "/delivery/orders/accepted", 
            icon: assets.tick_icon 
        },
        { 
            name: "Delivered History", 
            path: "/delivery/delivered", 
            icon: assets.tick_icon 
        },
        { 
            name: "Cancelled Orders", 
            path: "/delivery/cancelled", 
            icon: assets.cross_icon 
        },
        { 
            name: "Profile Setup", 
            path: "/delivery/setup", 
            icon: assets.product_list_icon 
        },
    ];

    const logout = () => {
        try {
            localStorage.removeItem('deliveryToken');
            localStorage.removeItem('deliveryUser'); 
            localStorage.removeItem('deliveryInfo');
            localStorage.removeItem('permanentHiddenOrders'); // Clean up hide list on logout
            
            toast.success("Logged out successfully");

            // This triggers the useEffect in App.js to update the deliveryToken state
            window.dispatchEvent(new Event('storage'));
            
            // Redirect to login
            window.location.href = '/delivery/login'; 
            
        } catch (error) {
            toast.error("Logout failed");
            console.error(error);
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* --- TOP NAVBAR --- */}
            <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white sticky top-0 z-10">
                <Link to='/'>
                    <img src={assets.logo} alt="logo" className="cursor-pointer w-34 md:w-38" />
                </Link>
                <div className="flex items-center gap-5 text-gray-500">
                    <p className="font-medium md:block hidden">Hi! Delivery Partner</p>
                    <button 
                        onClick={logout} 
                        className='border border-gray-300 rounded-full text-sm px-4 py-1 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all cursor-pointer'
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex flex-1">
                {/* --- SIDEBAR --- */}
                <div className="md:w-64 w-20 border-r h-[calc(100vh-65px)] text-base border-gray-300 pt-4 flex flex-col sticky top-[65px] bg-white">
                    {sidebarLinks.map((item) => (
                        <NavLink 
                            to={item.path} 
                            key={item.name} 
                            // Ensures only the exact route is highlighted
                            end={item.path === "/delivery/dashboard"}
                            className={({ isActive }) => `flex items-center py-4 px-4 gap-3 transition-all
                                ${isActive 
                                    ? "border-r-4 md:border-r-[6px] bg-blue-50 border-blue-600 text-blue-700"
                                    : "hover:bg-gray-50 border-white text-gray-600"
                                }`
                            }
                        >
                            <img src={item.icon} alt="" className="w-6 h-6 opacity-80" />
                            <p className="md:block hidden font-semibold text-sm">{item.name}</p>
                        </NavLink>
                    ))}
                </div> 

                {/* --- MAIN CONTENT AREA --- */}
                <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryLayout;