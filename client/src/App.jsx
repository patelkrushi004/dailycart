import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import { Toaster } from "react-hot-toast";
import Footer from './components/Footer';
import { useAppContext } from './context/AppContext';
import Login from './components/Login';
import AllProducts from './pages/AllProducts';
import ProductCategory from './pages/ProductCategory';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import AddAddress from './pages/AddAddress';
import MyOrders from './pages/MyOrders';
import SellerLogin from './components/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import AddProduct from './pages/seller/AddProduct';
import ProductList from './pages/seller/ProductList';
import Orders from './pages/seller/Orders';
import Loading from './components/Loading';

// Delivery Imports
import DeliveryDashboard from './pages/delivery/DeliveryDashboard'; 
import DeliverySetup from './pages/delivery/DeliverySetup';
import DeliveryLayout from './pages/delivery/DeliveryLayout'; 
import DeliveryLogin from './components/delivery/DeliveryLogin';
import DeliveredOrders from './pages/delivery/DeliveredOrders'; 
import CancelledOrders from './pages/delivery/CancelledOrders';
import AcceptedOrders from './pages/delivery/AcceptedOrders';

const App = () => {
  const location = useLocation();
  const { showUserLogin, isSeller } = useAppContext();
  
  // Initialize state directly from localStorage
  const [deliveryToken, setDeliveryToken] = useState(localStorage.getItem('deliveryToken'));

  // Listen for route changes AND storage changes to sync the token
  useEffect(() => {
    const handleStorageChange = () => {
      setDeliveryToken(localStorage.getItem('deliveryToken'));
    };

    handleStorageChange(); // Run on location change

    // Listen for login/logout events across the app
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location]); 

  const isSellerPath = location.pathname.includes("seller");
  const isDeliveryPath = location.pathname.includes("delivery"); 

  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>
      {isSellerPath || isDeliveryPath ? null : <Navbar />} 
      {showUserLogin ? <Login /> : null}
      <Toaster position="top-center" reverseOrder={false} />

      <div className={`${isSellerPath || isDeliveryPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          {/* User Routes */}
          <Route path='/' element={<Home />} />
          <Route path='/products' element={<AllProducts />} />
          <Route path='/products/:category' element={<ProductCategory />} />
          <Route path='/products/:category/:id' element={<ProductDetails />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/add-address' element={<AddAddress />} />
          <Route path='/my-orders' element={<MyOrders />} />
          <Route path='/loader' element={<Loading />} />

          {/* Seller Routes */}
          <Route path='/seller' element={isSeller ? <SellerLayout /> : <SellerLogin />}>
            <Route index element={isSeller ? <AddProduct /> : null} />
            <Route path='product-list' element={<ProductList />} />
            <Route path='orders' element={<Orders />} />
          </Route>

          {/* --- DELIVERY ROUTES --- */}
          
          {/* 1. Public Delivery Login Route */}
          <Route 
            path='/delivery/login' 
            element={deliveryToken ? <Navigate to="/delivery/dashboard" /> : <DeliveryLogin />} 
          />

          {/* 2. Protected Delivery Routes */}
          <Route 
            path='/delivery' 
            element={deliveryToken ? <DeliveryLayout /> : <Navigate to="/delivery/login" />}
          >
            {/* Redirect /delivery directly to /delivery/dashboard */}
            <Route index element={<Navigate to="dashboard" />} />
            
            <Route path="dashboard" element={<DeliveryDashboard />} />
            
            {/* Nested Orders Routes */}
            <Route path="orders">
                <Route index element={<Navigate to="/delivery/dashboard" />} /> 
                <Route path="accepted" element={<AcceptedOrders />} />
            </Route>

            <Route path='delivered' element={<DeliveredOrders />} />
            <Route path='cancelled' element={<CancelledOrders />} />
            <Route path='setup' element={<DeliverySetup />} />
          </Route>

          {/* Catch-all for misspelled delivery URLs */}
          <Route path='/delivery/*' element={<Navigate to="/delivery/login" />} />

        </Routes>
      </div>

      {!isSellerPath && !isDeliveryPath && <Footer />}
    </div>
  )
}

export default App;