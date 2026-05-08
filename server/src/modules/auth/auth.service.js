import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./user.model.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

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

const normalizeEmail = (email) => email.trim().toLowerCase();

const validateRegistrationData = (email, password) => {
	if (!EMAIL_REGEX.test(email)) {
		throw createError(400, "Podaj poprawny adres email");
	}

	if (password.length < PASSWORD_MIN_LENGTH || !PASSWORD_POLICY_REGEX.test(password)) {
		throw createError(
			400,
			"Hasło musi mieć min. 8 znaków oraz zawierać małą i dużą literę, cyfrę i znak specjalny"
		);
	}
};

export const registerUser = async ({ email, password, role }) => {
	if (!email || !password) {
		throw createError(400, "Email i hasło są wymagane");
	}

	const normalizedEmail = normalizeEmail(email);
	const normalizedPassword = password.trim();
	validateRegistrationData(normalizedEmail, normalizedPassword);

	if (role && role !== "client") {
		throw createError(403, "Rejestracja dostępna jest tylko dla klienta");
	}

	const existingUser = await User.findOne({ email: normalizedEmail });
	if (existingUser) {
		throw createError(400, "Użytkownik już istnieje");
	}

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(normalizedPassword, salt);

	const newUser = new User({
		email: normalizedEmail,
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

	const normalizedEmail = normalizeEmail(email);
	const user = await User.findOne({ email: normalizedEmail });
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

export const changePassword = async ({ email, oldPassword, newPassword }) => {
	if (!email || !oldPassword || !newPassword) {
		throw createError(400, "Email, stare hasło i nowe hasło są wymagane");
	}

	const normalizedEmail = normalizeEmail(email);
	const normalizedNewPassword = newPassword.trim();
	if (
		normalizedNewPassword.length < PASSWORD_MIN_LENGTH ||
		!PASSWORD_POLICY_REGEX.test(normalizedNewPassword)
	) {
		throw createError(
			400,
			"Hasło musi mieć min. 8 znaków oraz zawierać małą i dużą literę, cyfrę i znak specjalny"
		);
	}

	const user = await User.findOne({ email: normalizedEmail });
	if (!user) {
		throw createError(400, "Nieprawidłowy email lub stare hasło");
	}

	const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
	if (!isOldPasswordCorrect) {
		throw createError(400, "Nieprawidłowy email lub stare hasło");
	}

	const isSameAsOld = await bcrypt.compare(normalizedNewPassword, user.password);
	if (isSameAsOld) {
		throw createError(400, "Nowe hasło musi różnić się od starego");
	}

	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(normalizedNewPassword, salt);
	await user.save();

	return { message: "Hasło zostało zmienione" };
};