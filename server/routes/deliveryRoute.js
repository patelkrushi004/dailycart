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
// If you have an auth middleware, import it here
// import authDelivery from '../middleware/authDelivery.js'; 

const deliveryRouter = express.Router();

// --- AUTHENTICATION (Public) ---
deliveryRouter.post('/register', registerDelivery);
deliveryRouter.post('/login', loginDelivery);

// --- ORDER OPERATIONS ---

// 1. Get orders (Available or Accepted)
// Frontend matches: axios.get('/api/delivery/available')
deliveryRouter.get('/available', getAvailableOrders);

// 2. Accept an order
// Frontend matches: axios.post('/api/delivery/accept')
deliveryRouter.post('/accept', acceptOrder);

// 3. Update status (Delivered/Cancelled)
deliveryRouter.post('/status', updateDeliveryStatus);

// 4. Get specific partner history
deliveryRouter.get('/list/:deliveryBoyId', getDeliveryHistory);

// --- PROFILE ---
deliveryRouter.post('/setup/:id', updateDeliverySetup);

export default deliveryRouter;