import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast';

const DeliveryLogin = () => {
    const { navigate, axios, setIsDelivery, isDelivery, setUser } = useAppContext()
    
    // 1. Added state to toggle between login and register
    const [state, setState] = useState("login"); 
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();
            
            // 2. Updated URL to use the 'state' (calls /login or /register)
            const { data } = await axios.post(`/api/delivery/${state}`, { name, email, password })
            
            if (data.success) {
                localStorage.setItem('deliveryToken', data.token);
                
                if (setIsDelivery) setIsDelivery(true);
                if (setUser) setUser(data.user);

                toast.success(state === "login" ? "Welcome back, Partner!" : "Account Created Successfully!");

                if (data.user.isFirstLogin || state === "register") {
                    navigate('/delivery/setup')
                } else {
                    navigate('/delivery/dashboard')
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('deliveryToken');
        if (token || isDelivery) {
            navigate("/delivery/dashboard")
        }
    }, [isDelivery, navigate])

  return (
    <form onSubmit={onSubmitHandler} className='min-h-screen flex items-center text-sm text-gray-600 bg-gray-50'>

        <div className='flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200 bg-white'>
            
            <p className='text-2xl font-medium m-auto'>
                <span className="text-primary">Delivery</span> {state === "login" ? "Login" : "Sign Up"}
            </p>

            {/* 3. Added Conditional Name Field for Registration */}
            {state === "register" && (
                <div className="w-full">
                    <p>Name</p>
                    <input 
                        onChange={(e) => setName(e.target.value)} 
                        value={name}
                        type="text" 
                        placeholder="enter your full name" 
                        className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" 
                        required 
                    />
                </div>
            )}
            
            <div className="w-full ">
                <p>Email</p>
                <input 
                    onChange={(e) => setEmail(e.target.value)} 
                    value={email}
                    type="email" 
                    placeholder="enter your email" 
                    className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" 
                    required 
                />
            </div>

            <div className="w-full ">
                <p>Password</p>
                <input 
                    onChange={(e) => setPassword(e.target.value)} 
                    value={password}
                    type="password" 
                    placeholder="enter your password"
                    className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" 
                    required 
                />
            </div>

            <button type="submit" className="bg-primary text-white w-full py-2 rounded-md cursor-pointer hover:bg-opacity-90 transition-all">
                {state === "login" ? "Login" : "Create Account"}
            </button>
            
            {/* 4. Added Toggle Link to switch between Login and Register */}
            {state === "login" ? (
                <p className='m-auto text-sm'>
                    Become a partner? <span onClick={() => setState("register")} className="text-primary cursor-pointer underline">Register here</span>
                </p>
            ) : (
                <p className='m-auto text-sm'>
                    Already have an account? <span onClick={() => setState("login")} className="text-primary cursor-pointer underline">Login here</span>
                </p>
            )}

            <p className='m-auto text-xs text-gray-400 mt-2'>Access the Delivery Partner Portal</p>
        </div>

    </form>
  )
}

export default DeliveryLogin;