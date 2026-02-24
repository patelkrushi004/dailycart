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
deliveryRouter.post('/register', registerDelivery);
deliveryRouter.post('/login', loginDelivery);

// --- Dashboard Routes ---
// This fetches orders that are not yet delivered
deliveryRouter.get('/available', getAvailableOrders);

// This matches your Dashboard call to accept an order
deliveryRouter.post('/accept-order', acceptOrder); 

// --- Order Management ---
// This is used to change status (e.g., to 'Picked Up' or 'Delivered')
deliveryRouter.post('/update-status', updateDeliveryStatus);

// --- History & Profile ---
// Fetches completed orders for a specific delivery boy
deliveryRouter.get('/list/:deliveryBoyId', getDeliveryHistory);

// Initial profile setup (phone, vehicle type)
deliveryRouter.post('/setup/:id', updateDeliverySetup);

export default deliveryRouter;