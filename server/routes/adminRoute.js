import express from "express";
import User from "../models/User.js";
import orderModel from "../models/Order.js"; 
import productModel from "../models/Product.js"; 

const adminRouter = express.Router();

// --- 1. DASHBOARD STATS (ROBUST REVENUE FIX) ---
adminRouter.get("/stats", async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await productModel.countDocuments();
        const orders = await orderModel.find({});
        
        /** * THE FIX: 
         * 1. We check both 'amount' and 'price' fields.
         * 2. We accept 'payment' as true, "true", or status "Received".
         * 3. We use Number() to prevent string concatenation.
         */
        const totalSales = orders.reduce((acc, order) => {
            const isPaid = 
                order.payment === true || 
                order.payment === "true" || 
                order.paymentStatus === "Received" ||
                order.status === "Delivered"; // Delivered usually implies paid

            if (isPaid) {
                // Use || to pick whichever field exists in your schema
                const orderValue = order.amount || order.price || 0;
                return acc + Number(orderValue);
            }
            return acc;
        }, 0);
        
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

// --- 2. UPDATE ORDER STATUS ---
adminRouter.post("/update-status", async (req, res) => {
    try {
        const { orderId, status } = req.body;
        let updateData = { status };

        if (status === "Delivered") {
            updateData.payment = true;
            updateData.paymentStatus = "Received";
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

// --- 3. MANUAL PAYMENT TOGGLE ---
adminRouter.post("/update-payment", async (req, res) => {
    try {
        const { orderId, payment } = req.body; 

        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId, 
            { 
                payment: payment,
                paymentStatus: payment ? "Received" : "Pending" 
            }, 
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.json({ success: true, message: payment ? "Payment Received" : "Payment Pending" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- 4. REPORT ENGINE ---
adminRouter.get("/reports/:category", async (req, res) => {
    try {
        const { category } = req.params;
        const { search, startDate, endDate } = req.query;
        let query = {};

        if (startDate && endDate) {
            query.createdAt = { 
                $gte: new Date(startDate), 
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) 
            };
        }

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
            case 'payments': 
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