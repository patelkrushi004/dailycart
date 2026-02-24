import Order from "../models/Order.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// --- REGISTER ---
export const registerDelivery = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing required fields" });
        }
        const exists = await User.findOne({ email });
        if (exists) return res.json({ success: false, message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword, 
            role: 'delivery',
            isFirstLogin: true 
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "default_secret_key");
        res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, isFirstLogin: true } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- LOGIN ---
export const loginDelivery = async (req, res) => {
    try {
        const { email, password } = req.body;
        const delivery = await User.findOne({ email });
        if (!delivery || delivery.role !== "delivery") {
            return res.json({ success: false, message: "Delivery account not found" });
        }
        const isMatch = await bcrypt.compare(password, delivery.password);
        if (!isMatch) return res.json({ success: false, message: "Invalid password" });

        const token = jwt.sign({ id: delivery._id }, process.env.JWT_SECRET || "default_secret_key", { expiresIn: "30d" });
        res.json({ 
            success: true, 
            token, 
            user: { 
                _id: delivery._id, 
                name: delivery.name, 
                email: delivery.email, 
                isFirstLogin: delivery.isFirstLogin 
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET AVAILABLE ORDERS ---
export const getAvailableOrders = async (req, res) => {
    try {
        const query = { status: { $ne: "Delivered" } };
        const orders = await Order.find(query)
            .populate('address')
            .populate({ path: 'items.product', model: 'product' })
            .sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- ACCEPT & COMPLETE ORDER ---
export const acceptOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) return res.json({ success: false, message: "Order ID is required" });

        const order = await Order.findByIdAndUpdate(orderId, {
            status: "Delivered",
            isPaid: true,
            deliveryStatus: "delivered",
            deliveredAt: Date.now()
        }, { new: true });

        if (!order) return res.json({ success: false, message: "Order not found" });

        res.json({ success: true, message: "Status Updated: Delivered & Paid" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- DELIVERY HISTORY ---
export const getDeliveryHistory = async (req, res) => {
    try {
        const { deliveryBoyId } = req.params;
        if (!deliveryBoyId || deliveryBoyId === "undefined") return res.json({ success: true, orders: [] });

        const orders = await Order.find({ deliveryBoy: deliveryBoyId, status: "Delivered" })
            .populate('address')
            .populate({ path: 'items.product', model: 'product' })
            .sort({ deliveredAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- UPDATE STATUS ---
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        if (!orderId) return res.json({ success: false, message: "Order ID required" });

        let updateData = { status };
        if (status === "Delivered") {
            updateData.isPaid = true;
            updateData.deliveryStatus = "delivered";
            updateData.deliveredAt = Date.now();
        }

        const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
        res.json({ success: true, message: "Status updated", order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- SETUP PROFILE (FIXED NODEMON CRASH) ---
export const updateDeliverySetup = async (req, res) => {
    try {
        const { id } = req.params;
        const { vehicleType, phone, email } = req.body;

        if (!id) return res.json({ success: false, message: "User ID is required" });

        // Using "User" instead of "deliveryModel" to prevent crashes
        const updatedUser = await User.findByIdAndUpdate(
            id, 
            {
                vehicleType,
                phone,
                email, 
                isFirstLogin: false 
            }, 
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.json({ success: false, message: "Delivery partner not found" });
        }

        res.json({ 
            success: true, 
            message: "Profile Setup Complete!", 
            user: updatedUser 
        });
    } catch (error) {
        console.error("Setup Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};