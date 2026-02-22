import Order from "../models/Order.js";
import User from "../models/User.js"; 
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// --- AUTHENTICATION ---

export const registerDelivery = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing Details" });
        }
        const exists = await User.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'delivery', 
            isFirstLogin: true
        });

        const user = await newUser.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

        res.json({ success: true, token, user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isFirstLogin: user.isFirstLogin
        }});
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const loginDelivery = async (req, res) => {
    const { email, password } = req.body;
    try {
        const delivery = await User.findOne({ email });
        if (!delivery) {
            return res.status(404).json({ success: false, message: "Account not found" });
        }
        if (delivery.role !== 'delivery') {
            return res.status(401).json({ success: false, message: "Not a Delivery Partner account" });
        }
        const isMatch = await bcrypt.compare(password, delivery.password);
        if (isMatch) {
            const token = jwt.sign({ id: delivery._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
            
            // --- UPDATED SIMPLE RESPONSE ---
            res.json({
                success: true,
                token,
                user: {
                    _id: delivery._id, 
                    name: delivery.name,
                    role: delivery.role,
                    isFirstLogin: delivery.isFirstLogin 
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid password" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- ORDER LOGIC ---

export const getAvailableOrders = async (req, res) => {
    try {
        const { deliveryBoyId } = req.query;

        const query = { 
            status: { $in: ['Order Placed', 'Out for Delivery'] },
            $or: [
                { deliveryBoy: null },
            ]
        };

        if (deliveryBoyId && mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
            query.$or.push({ deliveryBoy: deliveryBoyId });
        }

        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const acceptOrder = async (req, res) => {
    const { orderId, deliveryBoyId } = req.body; 
    
    // Safety check for valid IDs
    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
        return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    try {
        const activeTasks = await Order.countDocuments({ deliveryBoy: deliveryBoyId, status: 'Out for Delivery' });
        if (activeTasks >= 3) {
            return res.status(400).json({ success: false, message: "Task limit reached (Max 3)" });
        }

        const order = await Order.findOneAndUpdate(
            { _id: orderId, deliveryBoy: null }, 
            { deliveryBoy: deliveryBoyId, deliveryStatus: 'accepted', status: 'Out for Delivery' },
            { new: true }
        );

        if (!order) {
            return res.status(400).json({ success: false, message: "Order no longer available" });
        }

        res.status(200).json({ success: true, message: "Accepted!", order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDeliveryStatus = async (req, res) => {
    const { orderId, status } = req.body; 
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ success: false, message: "Invalid Order ID" });
    }

    try {
        const updateData = { status: status }; 
        if (status === 'Delivered') {
            updateData.deliveryStatus = 'delivered';
            updateData.isPaid = true; 
            updateData.deliveredAt = Date.now(); 
        } else if (status === 'Cancelled') {
            updateData.deliveryStatus = 'cancelled';
            updateData.deliveryBoy = null; 
        }

        const order = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        res.status(200).json({ success: true, message: `Order updated to ${status}`, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDeliveryHistory = async (req, res) => {
    try {
        const { deliveryBoyId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(deliveryBoyId)) {
            return res.status(400).json({ success: false, message: "Invalid Partner ID" });
        }

        const orders = await Order.find({ 
            deliveryBoy: deliveryBoyId,
            status: { $in: ['Delivered', 'Cancelled'] }
        }).sort({ updatedAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDeliverySetup = async (req, res) => {
    const { vehicleType, phone } = req.body;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid User ID" });
    }

    try {
        const updatedDelivery = await User.findByIdAndUpdate(
            id,
            { vehicleType, phone, isFirstLogin: false }, 
            { new: true }
        );
        res.json({ success: true, user: updatedDelivery });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};