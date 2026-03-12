import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DeliveryDashboard = () => {
    const navigate = useNavigate();
    const [isCheckingSetup, setIsCheckingSetup] = useState(true);
    const [needsSetup, setNeedsSetup] = useState(false);

    const getAuth = () => {
        const token = localStorage.getItem('deliveryToken');
        const rawUser = localStorage.getItem('deliveryUser');
        let user = null;
        try { user = rawUser ? JSON.parse(rawUser) : null; } catch (e) { console.error(e); }
        return { token, user };
    };

    useEffect(() => {
        const { user, token } = getAuth();
        
        if (!token) {
            navigate('/delivery/login');
            return;
        }

        if (user && user.isFirstLogin === true) {
            setNeedsSetup(true);
            setIsCheckingSetup(false);
        } else {
            setNeedsSetup(false);
            setIsCheckingSetup(false);
        }
    }, [navigate]);

    if (isCheckingSetup) return <div className="min-h-screen bg-gray-50"></div>;
    
    const { user } = getAuth();

    return (
        <div className="bg-gray-50 min-h-[90vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                
                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-gray-200/60 border border-gray-100 text-center">
                    
                    {/* Icon Section */}
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <span className="text-4xl">🚀</span>
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {needsSetup ? "Almost There!" : `Hi, ${user?.name.split(' ')[0]}!`}
                    </h1>
                    
                    <p className="text-gray-500 mt-3 font-medium px-4">
                        {needsSetup 
                            ? "Please complete your profile setup to start receiving delivery tasks." 
                            : "Your dashboard is active. You can now manage your deliveries."}
                    </p>

                    {/* --- DYNAMIC BUTTON SECTION --- */}
                    <div className="mt-10 space-y-4">
                        {needsSetup ? (
                            /* THE REDIRECT BUTTON */
                            <button 
                                onClick={() => navigate('/delivery/setup')}
                                className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-green-200 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                            >
                                Finish Account Setup
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        ) : (
                            /* STANDARD DASHBOARD BUTTONS */
                            <>
                                <button 
                                    onClick={() => navigate('/delivery/history')}
                                    className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black hover:scale-[1.02] transition-all duration-300 shadow-xl active:scale-95 cursor-pointer"
                                >
                                    View History
                                </button>
                                <button 
                                    onClick={() => navigate('/delivery/delivered')}
                                    className="w-full bg-white text-gray-900 py-4 rounded-2xl font-bold text-lg border-2 border-gray-900 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
                                >
                                    Active Orders
                                </button>
                            </>
                        )}
                    </div>

                    <p className="mt-10 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Official Delivery Partner Portal
                    </p>
                </div>

            </div>
        </div>
    );
};

export default DeliveryDashboard;