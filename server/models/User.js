import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    // ADDED 'admin' to the enum list here
    enum: ['customer', 'seller', 'delivery', 'admin'], 
    default: 'customer'
  },

  // --- DELIVERY SPECIFIC FIELDS ---
  isFirstLogin: { type: Boolean, default: true },
  phone: { type: String, default: "" },
  vehicleType: { 
    type: String, 
    enum: ['Bike', 'Scooter', 'Cycle', 'Car', 'none', ''], 
    default: 'none' 
  },
  
  // --- CUSTOMER SPECIFIC FIELDS ---
  cartItems: { type: Object, default: {} },

}, { minimize: false, timestamps: true });

// Check if model exists before creating to prevent compilation errors
const User = mongoose.models.user || mongoose.model('user', userSchema);

export default User;