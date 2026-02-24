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

// 1. Middlewares (Must be defined before routes)
// Note: Stripe Webhook MUST stay above express.json()
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175'
];

app.use(cors({ 
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }, 
    credentials: true 
}));

// 2. API Routes
app.get('/', (req, res) => res.send("API is Working"));

app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);
app.use('/api/delivery', deliveryRouter);

// 3. Connect Services & Start Server
// This wrapper ensures we don't start the server if the DB fails
const startServer = async () => {
    try {
        await connectDB();
        await connectCloudinary();
        console.log("Database & Cloudinary Connected ✅");

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Critical Connection Error ❌:", error.message);
        process.exit(1); // Stop the process if we can't connect
    }
};

startServer();