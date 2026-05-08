import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null },
    reservationDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    numberOfGuests: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model("Reservation", reservationSchema);