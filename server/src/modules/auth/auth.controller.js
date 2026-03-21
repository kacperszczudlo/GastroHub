import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./user.model.js";

export const registerUser = async(req, res) => {
    try {
        const {  email, password, role } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: "Email i hasło są wymagane" });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Użytkownik już istnieje" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({  email, password: hashedPassword, role: role || "client" });
        await newUser.save();

        res.status(201).json({ message: "Użytkownik zarejestrowany pomyślnie" });

    }
    catch (error) {
        res.status(500).json({ error: "Błędny email lub hasło" });
    }
}

export const loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: "Email i hasło są wymagane" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Nieprawidłowy email lub hasło" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Nieprawidłowy email lub hasło" });
        }

        const payLoad = { userId: user._id, role: user.role };
        const token = jwt.sign(payLoad, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ token });
    }
    catch (error) {
        res.status(500).json({ error: "Błąd serwera podczas logowania" });
    }
}