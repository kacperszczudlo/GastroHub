import * as authService from "./auth.service.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
	const result = await authService.registerUser(req.body);
	res.status(201).json(result);
});

export const loginUser = asyncHandler(async (req, res) => {
	const result = await authService.loginUser(req.body);
	res.status(200).json(result);
});

export const loginWithGoogle = asyncHandler(async (req, res) => {
	const result = await authService.loginWithGoogle(req.body);
	res.status(200).json(result);
});

export const changePassword = asyncHandler(async (req, res) => {
	const result = await authService.changePassword(req.body);
	res.status(200).json(result);
});

export const getWaiters = asyncHandler(async (req, res) => {
	const result = await authService.getWaiters();
	res.status(200).json(result);
});
