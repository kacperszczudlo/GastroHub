import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null },
    waiter: { type: String, default: null },
    items: [
        {
            menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
            quantity: { type: Number, required: true, min: 1 }
        }
    ],
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['open', 'paid', 'cancelled'], default: 'open' }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);