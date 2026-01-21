import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  // Link delivery boy to User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  area: {
    type: String
  },

  isAvailable: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

const Delivery =
  mongoose.models.delivery || mongoose.model('delivery', deliverySchema);

export default Delivery;
