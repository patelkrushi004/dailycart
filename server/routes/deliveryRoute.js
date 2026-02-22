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

// --- AUTHENTICATION ---
deliveryRouter.post('/register', registerDelivery);
deliveryRouter.post('/login', loginDelivery);

// --- ORDER OPERATIONS ---

// 1. Get all available/active orders for the dashboard
deliveryRouter.get('/available', getAvailableOrders);

// 2. Assign a delivery partner to an order
deliveryRouter.post('/accept', acceptOrder);

// 3. Update order to "Delivered" or "Cancelled"
// This matches: axios.post('http://localhost:4000/api/delivery/status', ...)
deliveryRouter.post('/status', updateDeliveryStatus);

// 4. Get history (Delivered/Cancelled) for a specific partner
// This matches: axios.get(`http://localhost:4000/api/delivery/list/${deliveryBoyId}`)
deliveryRouter.get('/list/:deliveryBoyId', getDeliveryHistory);

// --- PROFILE ---

// Update vehicle and phone details
deliveryRouter.post('/setup/:id', updateDeliverySetup);

export default deliveryRouter;