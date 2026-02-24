import React from 'react';
import { NavLink } from "react-router-dom";
import { assets } from "../../assets/assets";

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  // We use these for the labels, but we'll use NavLink style logic
  const menuItems = [
    { id: 'users', label: 'Manage Users', icon: assets.order_icon },
    { id: 'products', label: 'Manage Products', icon: assets.add_icon },
    { id: 'orders', label: 'All Orders', icon: assets.order_icon },
    { id: 'payments', label: 'Payments', icon: assets.product_list_icon },
  ];

  return (
    <div className="md:w-64 w-20 border-r h-[calc(100vh-65px)] border-gray-300 pt-4 flex flex-col sticky top-[65px] bg-white">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex items-center py-4 px-4 gap-3 transition-all border-r-4 w-full text-left ${
            activeTab === item.id
              ? "bg-blue-50 border-blue-600 text-blue-700"
              : "text-gray-600 border-transparent hover:bg-gray-50"
          }`}
        >
          {/* Icon using your assets consistent with Delivery Panel */}
          <img 
            src={item.icon} 
            alt={item.label} 
            className={`w-6 h-6 ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`} 
          />
          
          {/* Text hidden on small screens, matching your Delivery Layout */}
          <p className="md:block hidden font-semibold text-sm">
            {item.label}
          </p>
        </button>
      ))}
    </div>
  );
};

export default AdminSidebar;