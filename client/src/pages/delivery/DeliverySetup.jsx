import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const DeliverySetup = () => {
  const [vehicleType, setVehicleType] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const storedData = localStorage.getItem('deliveryUser');
  const token = localStorage.getItem('deliveryToken'); 
  const deliveryInfo = storedData ? JSON.parse(storedData) : null;

  const handleCompleteSetup = async (e) => {
    e.preventDefault();

    if (!deliveryInfo || !token) {
      toast.error("Session expired. Please login again.");
      navigate('/delivery/login');
      return;
    }

    // Email validation: Check if input matches the logged-in user's email
    if (email.toLowerCase() !== deliveryInfo.email.toLowerCase()) {
      toast.error("Email does not match your login account!");
      return;
    }

    const deliveryBoyId = deliveryInfo._id || deliveryInfo.id;

    try {
      const { data } = await axios.put(`http://localhost:4000/api/delivery/update-setup/${deliveryBoyId}`, {
        vehicleType,
        phone,
        email,
        isFirstLogin: false 
      }, {
        headers: { token } 
      });

      if (data.success) {
        // Update local storage with full user object from backend
        // This ensures isFirstLogin is false and phone/vehicle are saved locally
        localStorage.setItem('deliveryUser', JSON.stringify(data.user));

        toast.success("Profile Setup Complete!");
        navigate('/delivery/delivered');
      }
    } catch (error) {
        console.error("Setup Error:", error);
        toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 p-4">
      <div className="p-8 bg-white shadow-xl rounded-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-2 text-gray-800">Verify Profile</h2>
        <p className="text-gray-500 mb-6">Confirm your details to start accepting orders.</p>
        
        <form onSubmit={handleCompleteSetup}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
          <input 
            type="email" 
            placeholder="Enter your login email"
            className="w-full p-3 mb-4 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
          <select 
            className="w-full p-3 mb-4 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            required
          >
            <option value="">Select Vehicle</option>
            <option value="Bike">Bike</option>
            <option value="Scooter">Scooter</option>
            <option value="Cycle">Cycle</option>
          </select>

          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input 
            type="tel" 
            placeholder="Enter your mobile number"
            className="w-full p-3 mb-6 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)} 
            required 
          />

          <button type="submit" className="w-full bg-green-600 text-white font-bold p-3 rounded-lg hover:bg-green-700 transition duration-300 shadow-md cursor-pointer">
            Confirm & Finish Setup
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeliverySetup;