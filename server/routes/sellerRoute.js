import express from 'express';
import { isSellerAuth, sellerLogin, sellerLogout } from '../controllers/sellerController.js';
import { getSellerOrders } from '../controllers/orderController.js'; 
import authSeller from '../middlewares/authSeller.js'; 

const sellerRouter = express.Router();

// --- Authentication Routes ---
sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/is-auth', authSeller, isSellerAuth);
sellerRouter.get('/logout', sellerLogout);

// --- Order Management Routes ---
// This handles: yourdomain.com/api/seller/order
sellerRouter.get('/order', authSeller, getSellerOrders); 

export default sellerRouter;