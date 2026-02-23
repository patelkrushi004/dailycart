import Order from "../models/Order.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// --- REGISTER ---
export const registerDelivery = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.json({ success: false, message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'delivery'
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret_key");
        res.json({ success: true, token, user });
    } catch (error) {
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

        const token = jwt.sign({ id: delivery._id }, process.env.JWT_SECRET || "secret_key", { expiresIn: "30d" });
        
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
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- UPDATE STATUS ---
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body; 

        let updateData = { status: status };

        if (status === "Delivered") {
            updateData.isPaid = true;
            updateData.deliveredAt = Date.now();
        }

        const order = await Order.findByIdAndUpdate(
            orderId, 
            updateData, 
            { new: true }
        );

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, message: "Status updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET AVAILABLE ORDERS ---
export const getAvailableOrders = async (req, res) => {
    try {
        const { deliveryBoyId } = req.query;
        
        const query = {
            $or: [
                { status: "Order Placed", deliveryBoy: null },
                { deliveryBoy: deliveryBoyId }
            ]
        };
        
        const orders = await Order.find(query)
            .populate('address')
            .sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- ACCEPT ORDER ---
export const acceptOrder = async (req, res) => {
    try {
        const { orderId, deliveryBoyId } = req.body;

        const checkOrder = await Order.findById(orderId);
        if (!checkOrder) return res.json({ success: false, message: "Order not found" });
        
        if (checkOrder.deliveryBoy && checkOrder.deliveryBoy !== deliveryBoyId) {
            return res.json({ success: false, message: "Order already accepted by someone else" });
        }

        const order = await Order.findByIdAndUpdate(orderId, {
            deliveryBoy: deliveryBoyId,
            status: "Order Accepted"
        }, { new: true });

        res.json({ success: true, message: "Order Accepted", order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- DELIVERY HISTORY ---
export const getDeliveryHistory = async (req, res) => {
    try {
        const { deliveryBoyId } = req.params;
        const orders = await Order.find({ 
            deliveryBoy: deliveryBoyId, 
            status: "Delivered" 
        })
        .populate('address')
        .sort({ deliveredAt: -1 });
        
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- SETUP PROFILE ---
export const updateDeliverySetup = async (req, res) => {
    try {
        const { id } = req.params;
        const { phone, vehicleType } = req.body;
        const user = await User.findByIdAndUpdate(id, { 
            phone, 
            vehicleType, 
            isFirstLogin: false 
        }, { new: true });
        
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};