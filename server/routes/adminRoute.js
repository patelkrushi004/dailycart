import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import orderModel from "../models/Order.js"; 
import productModel from "../models/Product.js"; 

const adminRouter = express.Router();

// --- NEW: DASHBOARD STATS ---
adminRouter.get("/stats", async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await productModel.countDocuments();
        const orders = await orderModel.find({});
        
        // Calculate Total Revenue
        const totalSales = orders.reduce((acc, order) => acc + (order.amount || 0), 0);
        
        res.json({ 
            success: true, 
            stats: { totalUsers, totalProducts, totalOrders: orders.length, totalSales } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- EXISTING REPORT ENGINE ---
adminRouter.get("/reports/:category", async (req, res) => {
    try {
        const { category } = req.params;
        const { search, startDate, endDate } = req.query;
        let query = {};

        if (startDate && endDate && startDate !== "" && endDate !== "") {
            query.createdAt = { 
                $gte: new Date(startDate), 
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) 
            };
        }

        if (search && search.trim() !== "") {
            const isObjectId = mongoose.isValidObjectId(search);
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
            if (isObjectId) query.$or.push({ _id: new mongoose.Types.ObjectId(search) });
        }

        let data;
        switch (category) {
            case 'users': data = await User.find(query).sort({ createdAt: -1 }); break;
            case 'orders': data = await orderModel.find(query).sort({ createdAt: -1 }); break;
            case 'products': data = await productModel.find(query).sort({ createdAt: -1 }); break;
            case 'payments': data = await orderModel.find({ payment: true, ...query }).sort({ createdAt: -1 }); break;
            default: return res.status(400).json({ success: false, message: "Invalid category" });
        }
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default adminRouter;