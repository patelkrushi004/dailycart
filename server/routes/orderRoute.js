import express from 'express';
import authUser from '../middlewares/authUser.js';
import authSeller from '../middlewares/authSeller.js';
import { 
    getAllOrders, 
    getUserOrders, 
    placeOrderCOD, 
    placeOrderStripe, 
    getDeliveryOrders, 
    updateOrderStatus 
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// --- Customer Routes ---
orderRouter.post('/cod', authUser, placeOrderCOD)
orderRouter.get('/user', authUser, getUserOrders)
orderRouter.post('/stripe', authUser, placeOrderStripe)

// --- Seller/Admin Routes ---
orderRouter.get('/seller', authSeller, getAllOrders)

// --- Delivery Routes ---
// We use authUser here so delivery personnel logged in as users can access this
orderRouter.get('/delivery-list', authUser, getDeliveryOrders) 
orderRouter.post('/status', authUser, updateOrderStatus)

export default orderRouter;