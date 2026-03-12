import express from "express";
import User from "../models/User.js";
import orderModel from "../models/Order.js"; 
import productModel from "../models/Product.js"; 

const adminRouter = express.Router();

// --- 1. DASHBOARD STATS ---
adminRouter.get("/stats", async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await productModel.countDocuments();
        const orders = await orderModel.find({});
        
        // Revenue counts only orders where payment is successful
        const totalSales = orders
            .filter(order => order.payment === true)
            .reduce((acc, order) => acc + (order.amount || 0), 0);
        
        res.json({ 
            success: true, 
            stats: { 
                totalUsers, 
                totalProducts, 
                totalOrders: orders.length, 
                totalSales 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- 2. UPDATE ORDER STATUS (WITH AUTO-PAYMENT) ---
// If status is set to "Delivered", payment is automatically marked true
adminRouter.post("/update-status", async (req, res) => {
    try {
        const { orderId, status } = req.body;
        let updateData = { status };

        if (status === "Delivered") {
            updateData.payment = true;
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(orderId, updateData, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- 3. MANUAL PAYMENT TOGGLE (FOR PAYMENTS SECTION) ---
// Allows marking as "Received" (true) or "Pending" (false)
adminRouter.post("/update-payment", async (req, res) => {
    try {
        const { orderId, payment } = req.body; 

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId, 
            { payment: payment }, 
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ 
            success: true, 
            message: payment ? "Payment marked as Received" : "Payment set to Pending" 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- 4. REPORT ENGINE (FETCH DATA BY TAB) ---
adminRouter.get("/reports/:category", async (req, res) => {
    try {
        const { category } = req.params;
        const { search, startDate, endDate } = req.query;
        let query = {};

        // Filter by Date Range
        if (startDate && endDate) {
            query.createdAt = { 
                $gte: new Date(startDate), 
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) 
            };
        }

        // Filter by Search Term
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        let data;
        switch (category) {
            case 'users': 
                data = await User.find(query).sort({ createdAt: -1 }); 
                break;
            case 'products': 
                data = await productModel.find(query).sort({ createdAt: -1 }); 
                break;
            case 'orders': 
            case 'payments': // Both tabs show orders but with different action buttons in UI
                data = await orderModel.find(query).sort({ createdAt: -1 }); 
                break;
            default: 
                return res.status(400).json({ success: false, message: "Invalid category" });
        }
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- 5. DELETE PRODUCT ---
adminRouter.delete("/product/:id", async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default adminRouter;