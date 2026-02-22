import mongoose from 'mongoose';

const DeliveryPartnerSchema = new mongoose.Schema({
  // Auth Fields (Required for Login)
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isFirstLogin: { type: Boolean, default: true }, 

  // Delivery Specific Fields
  vehicleType: { 
    type: String, 
    enum: ['bike', 'scooter', 'car', 'none'], 
    default: 'none' 
  },
  isOnline: { type: Boolean, default: false },
  phone: { type: String, default: "" },
  
  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  
  currentOrderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    default: null 
  },
  
  ratings: { type: Number, default: 5 }
}, { timestamps: true });

// Check if model already exists to prevent re-compilation errors
const DeliveryPartner = mongoose.models.DeliveryPartner || mongoose.model('DeliveryPartner', DeliveryPartnerSchema);

export default DeliveryPartner;