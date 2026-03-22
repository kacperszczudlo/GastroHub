import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    tableNumber: { type: Number, required: true, unique: true },
    capacity: { type: Number, required: true },
    status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' }
}, { timestamps: true });

export default mongoose.model("Table", userSchema);