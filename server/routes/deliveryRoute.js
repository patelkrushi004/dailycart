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
deliveryRouter.get('/available', getAvailableOrders);

// CHANGED: Matches DeliveryDashboard.jsx axios.post('.../accept-order')
deliveryRouter.post('/accept-order', acceptOrder); 

// --- Order Management ---
// Matches DeliveredOrders.jsx axios.post('.../update-status')
deliveryRouter.post('/update-status', updateDeliveryStatus);

// --- History & Profile ---
deliveryRouter.get('/list/:deliveryBoyId', getDeliveryHistory);
deliveryRouter.post('/setup/:id', updateDeliverySetup);

export default deliveryRouter;