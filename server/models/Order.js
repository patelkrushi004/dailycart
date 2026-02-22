import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'user' 
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'seller', 
    required: true 
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'product' },
    quantity: { type: Number, required: true }
  }],
  amount: { type: Number, required: true },
  address: { type: Object, required: true }, 
  status: { 
    type: String, 
    default: 'Order Placed',
    enum: ['Order Placed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled']
  },
  deliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'delivery', 
    default: null
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'accepted', 'picked', 'delivered', 'cancelled'],
    default: 'pending'
  },
  otp: { type: Number, default: null },
  pickedAt: { type: Date },
  deliveredAt: { type: Date },
  paymentType: { type: String, required: true }, 
  isPaid: { type: Boolean, required: true, default: false },

}, { 
  timestamps: true, // This creates 'createdAt' and 'updatedAt'
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Order = mongoose.models.order || mongoose.model('order', orderSchema);

export default Order;