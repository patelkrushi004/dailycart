import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  // Link admin to User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },

  phone: {
    type: String
  },

  isSuperAdmin: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

const Admin =
  mongoose.models.admin || mongoose.model('admin', adminSchema);

export default Admin;
