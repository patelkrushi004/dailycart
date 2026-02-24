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
  // isFirstLogin controls the "Verify Profile" redirect logic
  isFirstLogin: { type: Boolean, default: true },
  phone: { type: String, default: "" },
  vehicleType: { 
    type: String, 
    // Updated enum to match your Frontend <option> values exactly
    enum: ['Bike', 'Scooter', 'Cycle', 'Car', 'none', ''], 
    default: 'none' 
  },
  
  // --- CUSTOMER SPECIFIC FIELDS ---
  cartItems: { type: Object, default: {} },
}, { minimize: false, timestamps: true });

// Check if model exists before creating to prevent compilation errors
const User = mongoose.models.user || mongoose.model('user', userSchema);

export default User;