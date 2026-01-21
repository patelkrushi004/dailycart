import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // ✅ PASTE STEP 1 CODE HERE
  role: {
    type: String,
    enum: ['customer', 'seller', 'delivery'],
    default: 'customer'
  },

  cartItems: { type: Object, default: {} },
}, { minimize: false });

const User = mongoose.models.user || mongoose.model('user', userSchema);

export default User;
