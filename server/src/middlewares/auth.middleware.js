import jwt from "jsonwebtoken";
import { createHttpError } from "../common/httpError.js";

export const protect = (req, res, next) => {
	try {
		let token = req.headers.authorization;
		if (!token || !token.startsWith("Bearer ")) {
			return next(createHttpError(401, "Brak tokenu autoryzacyjnego"));
		}
		token = token.split(" ")[1];
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch {
		return next(createHttpError(401, "Nieprawidłowy token autoryzacyjny"));
	}
};

export const authorize = (roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(createHttpError(403, "Brak uprawnień do wykonania tej akcji"));
		}
		next();
	};
};
