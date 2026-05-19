import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "./user.model.js";
import { createHttpError } from "../../common/httpError.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

const normalizeEmail = (email) => email.trim().toLowerCase();

const validateRegistrationData = (email, password) => {
	if (!EMAIL_REGEX.test(email)) {
		throw createHttpError(400, "Podaj poprawny adres email");
	}

	if (password.length < PASSWORD_MIN_LENGTH || !PASSWORD_POLICY_REGEX.test(password)) {
		throw createHttpError(
			400,
			"Hasło musi mieć min. 8 znaków oraz zawierać małą i dużą literę, cyfrę i znak specjalny"
		);
	}
};

export const registerUser = async ({ email, password, role }) => {
	if (!email || !password) {
		throw createHttpError(400, "Email i hasło są wymagane");
	}

	const normalizedEmail = normalizeEmail(email);
	const normalizedPassword = password.trim();
	validateRegistrationData(normalizedEmail, normalizedPassword);

	if (role && role !== "client") {
		throw createHttpError(403, "Rejestracja dostępna jest tylko dla klienta");
	}

	const existingUser = await User.findOne({ email: normalizedEmail });
	if (existingUser) {
		throw createHttpError(400, "Użytkownik już istnieje");
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

export const loginUser = async ({ email, password }) => {
	if (!email || !password) {
		throw createHttpError(400, "Email i hasło są wymagane");
	}

	const normalizedEmail = normalizeEmail(email);
	const user = await User.findOne({ email: normalizedEmail });
	if (!user) {
		throw createHttpError(400, "Nieprawidłowy email lub hasło");
	}

	if (!user.password) {
		throw createHttpError(400, "To konto loguje się przez Google — użyj przycisku „Zaloguj się przez Google”.");
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw createHttpError(400, "Nieprawidłowy email lub hasło");
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
		throw createHttpError(400, "Email, stare hasło i nowe hasło są wymagane");
	}

	const normalizedEmail = normalizeEmail(email);
	const normalizedNewPassword = newPassword.trim();
	if (
		normalizedNewPassword.length < PASSWORD_MIN_LENGTH ||
		!PASSWORD_POLICY_REGEX.test(normalizedNewPassword)
	) {
		throw createHttpError(
			400,
			"Hasło musi mieć min. 8 znaków oraz zawierać małą i dużą literę, cyfrę i znak specjalny"
		);
	}

	const user = await User.findOne({ email: normalizedEmail });
	if (!user) {
		throw createHttpError(400, "Nieprawidłowy email lub stare hasło");
	}

	if (!user.password) {
		throw createHttpError(400, "Konto utworzone przez Google nie ma hasła lokalnego.");
	}

	const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
	if (!isOldPasswordCorrect) {
		throw createHttpError(400, "Nieprawidłowy email lub stare hasło");
	}

	const isSameAsOld = await bcrypt.compare(normalizedNewPassword, user.password);
	if (isSameAsOld) {
		throw createHttpError(400, "Nowe hasło musi różnić się od starego");
	}

	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(normalizedNewPassword, salt);
	await user.save();

	return { message: "Hasło zostało zmienione" };
};

const getGoogleOAuthClient = () => {
	const clientId = process.env.GOOGLE_CLIENT_ID;
	if (!clientId) {
		throw createHttpError(503, "Logowanie Google nie jest skonfigurowane po stronie serwera");
	}
	return new OAuth2Client(clientId);
};

export const loginWithGoogle = async ({ credential }) => {
	if (!credential) {
		throw createHttpError(400, "Brak tokenu Google");
	}

	const client = getGoogleOAuthClient();
	let ticket;
	try {
		ticket = await client.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID
		});
	} catch {
		throw createHttpError(401, "Nie udało się zweryfikować logowania Google");
	}

	const payload = ticket.getPayload();
	if (!payload?.email || !payload.sub) {
		throw createHttpError(401, "Brak wymaganych danych z konta Google");
	}

	if (payload.email_verified === false) {
		throw createHttpError(401, "Adres email w Google musi być zweryfikowany");
	}

	const email = normalizeEmail(payload.email);
	const googleSub = payload.sub;

	let user = await User.findOne({ googleSub });
	if (user) {
		const payLoad = { userId: user._id, role: user.role, email: user.email };
		const token = jwt.sign(payLoad, process.env.JWT_SECRET, { expiresIn: "1h" });
		return { token };
	}

	user = await User.findOne({ email });
	if (user) {
		if (user.googleSub && user.googleSub !== googleSub) {
			throw createHttpError(409, "Ten adres email jest już powiązany z innym kontem Google");
		}
		user.googleSub = googleSub;
		await user.save();
	} else {
		user = await User.create({
			email,
			googleSub,
			role: "client"
		});
	}

	const payLoad = { userId: user._id, role: user.role, email: user.email };
	const token = jwt.sign(payLoad, process.env.JWT_SECRET, { expiresIn: "1h" });
	return { token };
};