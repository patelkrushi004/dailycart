import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DeliveryLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:4000/api/delivery/login', { email, password });
            const data = response.data;

            if (data.success) {
                // 1. CLEAR old data to avoid "No ID found" ghost errors
                localStorage.removeItem('deliveryToken');
                localStorage.removeItem('deliveryUser');

                // 2. SAVE the new data
                localStorage.setItem('deliveryToken', data.token);
                localStorage.setItem('deliveryUser', JSON.stringify(data.user));
                
                toast.success("Login Successful!");

                // 3. SMALL DELAY: Ensures LocalStorage is fully written before redirect
                // This prevents the "No ID found" error on the dashboard
                setTimeout(() => {
                    if (data.user.isFirstLogin) {
                        navigate('/delivery/setup');
                    } else {
                        navigate('/delivery/dashboard'); 
                    }
                }, 150); 

            } else {
                toast.error(data.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Login error:", error);
            const serverMsg = error.response?.data?.message || "Login failed";
            toast.error(serverMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-xl">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Delivery Partner Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign in to start accepting orders
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={onSubmitHandler}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="delivery@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white ${
                                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all`}
                        >
                            {loading ? "Verifying..." : "Sign In"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeliveryLogin;