import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";

// --- PLACE ORDER FUNCTIONS ---

export const placeOrderCOD = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;

        // Extract sellerId from the first item
        const sellerId = items[0].sellerId;

        if (!sellerId) {
            return res.json({ success: false, message: "Seller ID is required to place order" });
        }

        const orderData = {
            userId,
            sellerId,
            items, 
            amount,
            address, 
            paymentType: "COD",
            isPaid: false,
            date: Date.now(),
            status: "Order Placed"
        };

        const newOrder = new Order(orderData);
        await newOrder.save();

        // SUCCESS: Clear the user's cart in the database after successful order
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        res.json({ success: true, message: "Order Placed Successfully" });

    } catch (error) {
        console.error("Order Error:", error);
        res.json({ success: false, message: error.message });
    }
};

export const placeOrderStripe = async (req, res) => {
    try {
        // Your Stripe logic here
        res.json({ success: true, message: "Stripe logic triggered" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const stripeWebhooks = async (req, res) => {
    try {
        res.status(200).send("Webhook received");
    } catch (error) {
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
};

// --- GET ORDER FUNCTIONS ---

// Function for Seller Panel to get their specific orders
export const getSellerOrders = async (req, res) => {
    try {
        // The 'authSeller' middleware attaches the sellerId to the request body
        const { sellerId } = req.body; 

        // 1. Find orders where this specific seller's ID is stored
        // 2. Populate 'items.product' to see what was bought
        // 3. Populate 'userId' to see who bought it
        const orders = await Order.find({ sellerId })
            .populate("items.product") 
            .populate("userId", "name email") 
            .sort({ date: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        console.error("Seller Order Fetch Error:", error);
        res.json({ success: false, message: error.message });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await Order.find({ userId }).populate("items.product").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate("items.product address").sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getDeliveryOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }],
            status: { $ne: "Delivered" }
        })
        .populate("items.product userId")
        .sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await Order.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: "Status Updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};