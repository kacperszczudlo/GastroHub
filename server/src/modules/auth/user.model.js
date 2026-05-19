import mongoose from "mongoose";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [EMAIL_REGEX, "Podaj poprawny adres email"]
    },
    password: {
        type: String,
        required: function requiredPassword() {
            return !this.googleSub;
        }
    },
    googleSub: { type: String, sparse: true, unique: true, trim: true },
    role: { type: String, enum: ['client', 'waiter', 'admin'], default: 'client' }
}, { timestamps: true });

export default mongoose.model("User", userSchema);