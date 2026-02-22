import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ['customer', 'seller', 'delivery'],
    default: 'customer'
  },

  // --- DELIVERY SPECIFIC FIELDS ---
  // These stay empty for customers but get filled for delivery partners
  isFirstLogin: { type: Boolean, default: true },
  phone: { type: String, default: "" },
  vehicleType: { 
    type: String, 
    enum: ['bike', 'scooter', 'car', 'none'], 
    default: 'none' 
  },
  
  // --- CUSTOMER SPECIFIC FIELDS ---
  cartItems: { type: Object, default: {} },
}, { minimize: false, timestamps: true }); // added timestamps to track when users join

const User = mongoose.models.user || mongoose.model('user', userSchema);

export default User;