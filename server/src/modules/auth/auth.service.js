import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./user.model.js";

const DEMO_PASSWORD = "GastroHub123!";
const DEMO_USERS = [
	{ email: "demo.client@gastrohub.local", role: "client" },
	{ email: "demo.waiter@gastrohub.local", role: "waiter" },
	{ email: "demo.admin@gastrohub.local", role: "admin" }
];

const createError = (status, message) => {
	const error = new Error(message);
	error.status = status;
	return error;
};

export const registerUser = async ({ email, password, role }) => {
	if (!email || !password) {
		throw createError(400, "Email i hasło są wymagane");
	}

	if (role && role !== "client") {
		throw createError(403, "Rejestracja dostępna jest tylko dla klienta");
	}

	const existingUser = await User.findOne({ email });
	if (existingUser) {
		throw createError(400, "Użytkownik już istnieje");
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	const newUser = new User({
		email,
		password: hashedPassword,
		role: role || "client"
	});
	await newUser.save();

	return { message: "Użytkownik zarejestrowany pomyślnie" };
};

export const seedDemoUsers = async () => {
	for (const demoUser of DEMO_USERS) {
		const existingUser = await User.findOne({ email: demoUser.email });
		if (existingUser) {
			continue;
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, salt);

		await User.create({
			email: demoUser.email,
			password: hashedPassword,
			role: demoUser.role
		});
	}
};

export const loginUser = async ({ email, password }) => {
	if (!email || !password) {
		throw createError(400, "Email i hasło są wymagane");
	}

	const user = await User.findOne({ email });
	if (!user) {
		throw createError(400, "Nieprawidłowy email lub hasło");
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw createError(400, "Nieprawidłowy email lub hasło");
	}

	const payLoad = { userId: user._id, role: user.role, email: user.email };
	const token = jwt.sign(payLoad, process.env.JWT_SECRET, { expiresIn: "1h" });

	return { token };
};

export const getWaiters = async () => {
	const waiters = await User.find({ role: "waiter" }, "_id email");
	return { waiters };
};