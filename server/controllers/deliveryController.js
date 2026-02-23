import Order from "../models/Order.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// =========================
// AUTHENTICATION
// =========================

export const registerDelivery = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.json({ success: false, message: "Missing Details" });

        const exists = await User.findOne({ email });
        if (exists) return res.json({ success: false, message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role: "delivery", isFirstLogin: true });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "30d" });
        res.json({ success: true, token, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const loginDelivery = async (req, res) => {
    try {
        const { email, password } = req.body;
        const delivery = await User.findOne({ email });
        if (!delivery || delivery.role !== "delivery") return res.status(401).json({ success: false, message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, delivery.password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid password" });

        const token = jwt.sign({ id: delivery._id }, process.env.JWT_SECRET || "secret", { expiresIn: "30d" });
        res.json({ success: true, token, user: delivery });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =========================
// ORDER OPERATIONS
// =========================

export const getAvailableOrders = async (req, res) => {
    try {
        const { deliveryBoyId } = req.query;
        let query = (deliveryBoyId && mongoose.Types.ObjectId.isValid(deliveryBoyId)) 
            ? { deliveryBoy: deliveryBoyId, status: "Order Accepted" } 
            : { status: "Order Placed", deliveryBoy: null };

        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const acceptOrder = async (req, res) => {
    try {
        const { orderId, deliveryBoyId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(orderId)) return res.json({ success: false, message: "Invalid Order ID" });

        const order = await Order.findByIdAndUpdate(
            orderId,
            { deliveryBoy: deliveryBoyId, status: "Order Accepted", deliveryStatus: "accepted" },
            { new: true }
        );

        if (!order) return res.json({ success: false, message: "Order not found" });
        res.json({ success: true, message: "Order Accepted", order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDeliveryStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        let updateData = { status };

        if (status === "Delivered") {
            updateData = { ...updateData, deliveryStatus: "delivered", isPaid: true, deliveredAt: Date.now() };
        } else if (status === "Cancelled") {
            updateData = { ...updateData, deliveryStatus: "cancelled", deliveryBoy: null };
        }

        const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
        res.json({ success: true, message: `Order ${status}`, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDeliveryHistory = async (req, res) => {
    try {
        const { deliveryBoyId } = req.params;
        const orders = await Order.find({ deliveryBoy: deliveryBoyId, status: { $in: ["Delivered", "Cancelled"] } }).sort({ updatedAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDeliverySetup = async (req, res) => {
    try {
        const { id } = req.params;
        const { vehicleType, phone } = req.body;
        const user = await User.findByIdAndUpdate(id, { vehicleType, phone, isFirstLogin: false }, { new: true });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};