import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: Array, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    // ADDED: Link to the Seller
    sellerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'seller', 
        required: true 
    },
}, { timestamps: true })

const Product = mongoose.models.product || mongoose.model('product', productSchema)

export default Product