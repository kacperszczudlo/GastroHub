import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    tableNumber: { type: Number, required: true, unique: true },
    capacity: { type: Number, required: true },
    status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    waiter: { type: String, default: null },
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Table", userSchema);