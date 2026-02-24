import express from 'express';
import { 
    registerDelivery, 
    loginDelivery, 
    getAvailableOrders, 
    acceptOrder, 
    updateDeliveryStatus, 
    getDeliveryHistory, 
    updateDeliverySetup 
} from '../controllers/deliveryController.js';

const deliveryRouter = express.Router();

// --- Auth Routes ---
// Register a new delivery partner
deliveryRouter.post('/register', registerDelivery);
// Login for delivery partner
deliveryRouter.post('/login', loginDelivery);

// --- Order Management Routes ---
// This fetches orders that are not yet delivered
deliveryRouter.get('/available', getAvailableOrders);

// This matches your Dashboard call to accept/complete an order
deliveryRouter.post('/accept-order', acceptOrder); 

// This is used to change status (e.g., to 'Picked Up' or 'Delivered')
deliveryRouter.post('/update-status', updateDeliveryStatus);

// --- History & Profile Routes ---
// Fetches completed orders for a specific delivery boy
deliveryRouter.get('/list/:deliveryBoyId', getDeliveryHistory);

// Initial profile setup (phone, vehicle type, email)
// UPDATED: Changed to .put to match the 'axios.put' call in your Frontend
deliveryRouter.put('/update-setup/:id', updateDeliverySetup);

export default deliveryRouter;