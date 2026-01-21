import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: 'user' },

  items: [{
    product: { type: String, required: true, ref: 'product' },
    quantity: { type: Number, required: true }
  }],

  amount: { type: Number, required: true },
  address: { type: String, required: true, ref: 'address' },

  // existing
  status: { type: String, default: 'Order Placed' },

  // 👇 STEP 1 CODE (PASTE HERE)
  deliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'delivery'
  },

  deliveryStatus: {
    type: String,
    enum: ['pending', 'accepted', 'picked', 'delivered'],
    default: 'pending'
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },

  paymentType: { type: String, required: true },
  isPaid: { type: Boolean, required: true, default: false },

}, { timestamps: true });

const Order = mongoose.models.order || mongoose.model('order', orderSchema);

export default Order;
