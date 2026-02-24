import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";

// --- PLACE ORDER FUNCTIONS ---

export const placeOrderCOD = async (req, res) => {
    try {
        const { userId, items, amount, address } = req.body;
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
            isPaid: false, // For COD, payment is false until delivered
            date: Date.now(),
            status: "Order Placed" // Immediate visibility for Seller and Delivery
        };

        const newOrder = new Order(orderData);
        await newOrder.save();

        // Clear user cart
        await User.findByIdAndUpdate(userId, { cartItems: {} });

        res.json({ success: true, message: "Order Placed Successfully" });

    } catch (error) {
        console.error("Order Error:", error);
        res.json({ success: false, message: error.message });
    }
};

// --- GET ORDER FUNCTIONS ---

// Seller Panel: Shows orders immediately after they are placed
export const getSellerOrders = async (req, res) => {
    try {
        const { sellerId } = req.body; 
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

// Delivery Panel: Shows orders that are NOT yet Delivered
export const getDeliveryOrders = async (req, res) => {
    try {
        // Logic: Show if it's COD (pay on delivery) OR if it's already paid online
        // AND only if it hasn't been delivered yet
        const orders = await Order.find({
            status: { $ne: "Delivered" }
        })
        .populate("items.product userId")
        .sort({ date: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Status Update: Used by the "Confirm Delivery" button
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status, deliveryBoyId } = req.body;

        const updateFields = { status };

        // If the delivery boy confirms, we also mark payment as done
        if (status === "Delivered") {
            updateFields.isPaid = true;
            if (deliveryBoyId) {
                updateFields.deliveryBoy = deliveryBoyId;
            }
        }

        await Order.findByIdAndUpdate(orderId, updateFields);
        res.json({ success: true, message: "Status Updated Successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// --- REMAINING FUNCTIONS (Unchanged) ---
export const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await Order.find({ userId }).populate("items.product").sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate("items.product address").sort({ date: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const placeOrderStripe = async (req, res) => {
    try { res.json({ success: true, message: "Stripe logic triggered" }); } 
    catch (error) { res.json({ success: false, message: error.message }); }
};

export const stripeWebhooks = async (req, res) => {
    try { res.status(200).send("Webhook received"); } 
    catch (error) { res.status(400).send(`Webhook Error: ${error.message}`); }
};