import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { assets } from "../../assets/assets";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({ totalSales: 0, totalProducts: 0, totalOrders: 0 });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const menuItems = [
        { id: 'users', label: 'Manage Users', icon: assets.order_icon },
        { id: 'products', label: 'Manage Products', icon: assets.add_icon },
        { id: 'orders', label: 'All Orders', icon: assets.order_icon },
        { id: 'payments', label: 'Payments', icon: assets.product_list_icon },
    ];

    const fetchStats = async () => {
        try {
            const res = await axios.get("http://localhost:4000/api/admin/stats");
            if (res.data.success) setStats(res.data.stats);
        } catch (err) { console.error(err); }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:4000/api/admin/reports/${activeTab}`, {
                params: { search: searchTerm, startDate: dateRange.start, endDate: dateRange.end }
            });
            if (res.data.success) setData(res.data.data);
        } catch (err) { toast.error("Error fetching data"); }
        setLoading(false);
    };

    useEffect(() => { 
        fetchData(); 
        fetchStats(); 
    }, [activeTab, dateRange]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const payload = activeTab === "payments"
                ? { orderId, paymentStatus: newStatus }
                : { orderId, status: newStatus };

            const res = await axios.post("http://localhost:4000/api/admin/update-status", payload);
            if (res.data.success) {
                toast.success("Status Updated");
                fetchData();
            }
        } catch (err) { toast.error("Update failed"); }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm("Delete this product?")) {
            try {
                const res = await axios.delete(`http://localhost:4000/api/admin/product/${id}`);
                if (res.data.success) {
                    toast.success("Deleted");
                    fetchData();
                    fetchStats();
                }
            } catch (err) { toast.error("Delete failed"); }
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.setFontSize(18);
        doc.text(`Dailycart ${activeTab.toUpperCase()} Report`, 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 20);

        // MAP DATA TO: ID, Price (Dollar), Status, Date for PDF ONLY
        const rows = data.map(item => [
            item._id.substring(18).toUpperCase(), 
            `$${item.price || item.amount || 0}`, 
            item.paymentStatus || item.status || 'N/A',
            item.createdAt ? item.createdAt.split('T')[0] : 'N/A'
        ]);

        autoTable(doc, { 
            head: [['ID', 'Price', 'Status', 'Date']], 
            body: rows, 
            startY: 28,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] },
            styles: { fontSize: 9 }
        });

        doc.save(`Dailycart_${activeTab}_Report.pdf`);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans">
            {/* Navbar */}
            <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white sticky top-0 z-20">
                <Link to='/'><img src={assets.logo} alt="logo" className="w-34 md:w-38" /></Link>
                <div className="flex items-center gap-5">
                    <p className="font-semibold md:block hidden text-gray-500 text-sm">Admin <span className="text-blue-600">Panel</span></p>
                    <button onClick={() => { localStorage.clear(); window.location.href='/'; }} className='border border-gray-300 rounded-full text-sm px-4 py-1 hover:bg-red-50 hover:text-red-600 transition-all'>Logout</button>
                </div>
            </div>

            <div className="flex flex-1">
                {/* Sidebar */}
                <div className="md:w-64 w-20 border-r h-[calc(100vh-65px)] border-gray-300 pt-4 flex flex-col sticky top-[65px] bg-white z-10">
                    {menuItems.map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center py-4 px-4 gap-3 transition-all border-r-4 ${activeTab === item.id ? "bg-blue-50 border-blue-600 text-blue-700" : "text-gray-600 border-transparent hover:bg-gray-50"}`}>
                            <img src={item.icon} alt="" className={`w-6 h-6 ${activeTab === item.id ? 'opacity-100' : 'opacity-60'}`} />
                            <p className="md:block hidden font-semibold text-sm">{item.label}</p>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        {/* Stats Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="bg-white p-5 border border-gray-300 rounded-lg shadow-sm">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
                                <h3 className="text-2xl font-bold text-gray-800">${stats.totalSales.toLocaleString()}</h3>
                            </div>
                            <div className="bg-white p-5 border border-gray-300 rounded-lg shadow-sm">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Inventory</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalProducts} Items</h3>
                            </div>
                            <div className="bg-white p-5 border border-gray-300 rounded-lg shadow-sm">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h3>
                            </div>
                        </div>

                        {/* Search & Export */}
                        <div className="bg-white p-4 border border-gray-300 rounded-lg mb-6 flex flex-wrap justify-between items-center gap-4 shadow-sm">
                            <div className="flex items-center gap-2 text-xs">
                                <input type="date" className="border border-gray-300 p-1.5 rounded-md outline-none" onChange={(e)=>setDateRange({...dateRange, start: e.target.value})}/>
                                <span className="text-gray-400">to</span>
                                <input type="date" className="border border-gray-300 p-1.5 rounded-md outline-none" onChange={(e)=>setDateRange({...dateRange, end: e.target.value})}/>
                            </div>
                            <div className="flex flex-1 md:max-w-md gap-2">
                                <input type="text" placeholder={`Search ${activeTab}...`} className="border border-gray-300 px-4 py-2 text-sm rounded-md outline-none w-full focus:border-blue-500" onChange={(e)=>setSearchTerm(e.target.value)} onKeyDown={(e)=> e.key === 'Enter' && fetchData()} />
                                <button onClick={downloadPDF} className="bg-blue-600 text-white px-4 py-2 rounded-md text-xs font-bold uppercase hover:bg-blue-700 transition-colors">Export PDF</button>
                            </div>
                        </div>

                        {/* Main Table */}
                        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-100 border-b border-gray-300 text-[11px] font-bold uppercase text-gray-500">
                                    <tr>
                                        <th className="p-4">Information</th>
                                        <th className="p-4">Price</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan="5" className="p-10 text-center text-blue-600 animate-pulse font-bold">LOADING...</td></tr>
                                    ) : (
                                        data.map(item => (
                                            <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <p className="font-bold text-sm text-gray-800">
                                                        {item.userId?.name || item.name || (activeTab === 'payments' ? `ID: ${item._id.substring(18)}` : "Guest")}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 italic">
                                                        {item.userId?.email || item.email || item.category || "System Record"}
                                                    </p>
                                                </td>
                                                <td className="p-4 text-sm font-semibold text-gray-700">${item.price || item.amount || 0}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.paymentStatus === 'Received' || item.status === 'Delivered' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                                                        {item.paymentStatus || item.status || "Pending"}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs text-gray-500">
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {activeTab === 'payments' && (
                                                        <select className="text-[10px] border border-gray-300 rounded p-1" value={item.paymentStatus || "Pending"} onChange={(e)=>handleUpdateStatus(item._id, e.target.value)}>
                                                            <option value="Pending">Pending</option>
                                                            <option value="Received">Received</option>
                                                        </select>
                                                    )}
                                                    {activeTab === 'orders' && (
                                                        <select className="text-[10px] border border-gray-300 rounded p-1" value={item.status} onChange={(e)=>handleUpdateStatus(item._id, e.target.value)}>
                                                            <option value="Order Placed">Placed</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                        </select>
                                                    )}
                                                    {activeTab === 'products' && (
                                                        <button onClick={()=>handleDeleteProduct(item._id)} className="text-red-500 text-[10px] font-bold uppercase hover:underline">Delete</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;