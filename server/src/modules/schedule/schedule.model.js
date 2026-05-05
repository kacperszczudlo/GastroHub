import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    waiter: { type: String, required: true }, // email kelnera
    date: { type: Date, required: true },
    shift: { type: String, enum: ['morning', 'afternoon', 'evening'], required: true },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
}, { timestamps: true });

scheduleSchema.index({ waiter: 1, date: 1, shift: 1 }, { unique: true });

export default mongoose.model("Schedule", scheduleSchema);
