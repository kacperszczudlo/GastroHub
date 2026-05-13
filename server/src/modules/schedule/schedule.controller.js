import * as scheduleService from "./schedule.service.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { createHttpError } from "../../common/httpError.js";

export const getScheduleByWaiter = asyncHandler(async (req, res) => {
	const { waiter } = req.query;
	if (!waiter) {
		throw createHttpError(400, "Email kelnera jest wymagany");
	}
	const result = await scheduleService.getScheduleByWaiter(waiter);
	res.status(200).json(result);
});

export const getAllSchedules = asyncHandler(async (req, res) => {
	const result = await scheduleService.getAllSchedules();
	res.status(200).json(result);
});

export const createSchedule = asyncHandler(async (req, res) => {
	const result = await scheduleService.createSchedule(req.body, req.user);
	res.status(201).json(result);
});

export const updateSchedule = asyncHandler(async (req, res) => {
	const result = await scheduleService.updateSchedule(req.params.id, req.body);
	res.status(200).json(result);
});

export const deleteSchedule = asyncHandler(async (req, res) => {
	const result = await scheduleService.deleteSchedule(req.params.id);
	res.status(200).json(result);
});
