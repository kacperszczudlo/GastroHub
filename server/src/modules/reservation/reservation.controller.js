import * as reservationService from "./reservation.service.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";

export const createAllReservations = asyncHandler(async (req, res) => {
	const result = await reservationService.createReservation(req.body, req.user);
	res.status(201).json(result);
});

export const getAllReservations = asyncHandler(async (req, res) => {
	const result = await reservationService.getAllReservations();
	res.status(200).json(result);
});

export const updateReservationStatus = asyncHandler(async (req, res) => {
	const result = await reservationService.updateReservationStatus(req.params.id, req.body);
	res.status(200).json(result);
});

export const checkInReservation = asyncHandler(async (req, res) => {
	const result = await reservationService.checkInReservation(req.params.id, req.user);
	res.status(200).json(result);
});

export const completeReservation = asyncHandler(async (req, res) => {
	const result = await reservationService.completeReservation(req.params.id, req.user);
	res.status(200).json(result);
});

export const cancelReservation = asyncHandler(async (req, res) => {
	const result = await reservationService.cancelReservation(req.params.id);
	res.status(200).json(result);
});

export const getUserReservations = asyncHandler(async (req, res) => {
	const result = await reservationService.getUserReservations(req.user.userId);
	res.status(200).json(result);
});

export const hardDeleteReservation = asyncHandler(async (req, res) => {
	const result = await reservationService.hardDeleteReservation(req.params.id);
	res.status(200).json(result);
});

export const pruneReservations = asyncHandler(async (req, res) => {
	const { days } = req.body;
	const result = await reservationService.pruneReservations(days || 90);
	res.status(200).json(result);
});
