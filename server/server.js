import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';
import deliveryRouter from './routes/deliveryRoute.js';

const app = express();
const port = process.env.PORT || 4000;

// Connect to Database and Cloudinary
await connectDB();
await connectCloudinary();

// 1. Middlewares (Must come before routes)
// Note: Stripe webhook needs express.raw, so it stays above express.json
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

app.use(express.json());
app.use(cookieParser());

// Allow multiple origins (Add your specific frontend URLs here)
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// 2. API Routes
app.get('/', (req, res) => res.send("API is Working"));

app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
app.use('/api/delivery', deliveryRouter);

// 3. Start Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});