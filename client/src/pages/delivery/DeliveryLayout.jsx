import React from 'react';
import { Link, NavLink, Outlet, Navigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import toast from "react-hot-toast";

const DeliveryLayout = () => {
    const token = localStorage.getItem('deliveryToken');

    if (!token) {
        return <Navigate to="/delivery/login" replace />;
    }

    // UPDATED LINKS: Added the 'History' tab specifically
    const sidebarLinks = [
        { 
            name: "Available Orders", 
            path: "/delivery/dashboard", 
            icon: assets.order_icon 
        },
        { 
            name: "Current Task", 
            path: "/delivery/delivered", // The page with the "Confirm" button
            icon: assets.tick_icon 
        },
        { 
            name: "Delivery History", 
            path: "/delivery/history", // The new page where orders stay forever
            icon: assets.order_icon // You can change this to a clock/history icon if available
        },
        { 
            name: "Profile Setup", 
            path: "/delivery/setup", 
            icon: assets.product_list_icon 
        },
    ];

    const logout = () => {
        localStorage.removeItem('deliveryToken');
        localStorage.removeItem('deliveryUser'); 
        toast.success("Logged out successfully");
        window.location.href = '/delivery/login'; 
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Navbar Section */}
            <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white sticky top-0 z-10">
                <Link to='/'>
                    <img src={assets.logo} alt="logo" className="w-34 md:w-38" />
                </Link>
                <div className="flex items-center gap-5 text-gray-500">
                    <p className="font-medium md:block hidden text-primary">Delivery Partner Panel</p>
                    <button onClick={logout} className='border border-gray-300 rounded-full text-sm px-4 py-1 hover:bg-red-50 hover:text-red-600 transition-all'>
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex flex-1">
                {/* Sidebar Section */}
                <div className="md:w-64 w-20 border-r h-[calc(100vh-65px)] border-gray-300 pt-4 flex flex-col sticky top-[65px] bg-white">
                    {sidebarLinks.map((item) => (
                        <NavLink 
                            to={item.path} 
                            key={item.name} 
                            end={item.path === "/delivery/dashboard"} 
                            className={({ isActive }) => `flex items-center py-4 px-4 gap-3 transition-all ${
                                isActive ? "border-r-4 bg-blue-50 border-blue-600 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            <img src={item.icon} alt="" className="w-6 h-6 opacity-80" />
                            <p className="md:block hidden font-semibold text-sm">{item.name}</p>
                        </NavLink>
                    ))}
                </div> 

                {/* Content Section */}
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