import * as tableService from "./table.service.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";

export const getAllTables = asyncHandler(async (req, res) => {
	const result = await tableService.getAllTables();
	res.status(200).json(result);
});

export const createTable = asyncHandler(async (req, res) => {
	const result = await tableService.createTable(req.body);
	res.status(201).json(result);
});

export const updateTable = asyncHandler(async (req, res) => {
	const result = await tableService.updateTable(req.params.id, req.body, req.user);
	res.status(200).json(result);
});

export const deleteTable = asyncHandler(async (req, res) => {
	const result = await tableService.deleteTable(req.params.id);
	res.status(200).json(result);
});

export const getTableById = asyncHandler(async (req, res) => {
	const result = await tableService.getTableById(req.params.id);
	res.status(200).json(result);
});

export const assignWaiter = asyncHandler(async (req, res) => {
	const tableId = req.params.id;
	const { waiter } = req.body;
	const result = await tableService.assignWaiter(tableId, waiter || null, req.user);
	res.status(200).json(result);
});

export const unassignWaiter = asyncHandler(async (req, res) => {
	const tableId = req.params.id;
	const result = await tableService.unassignWaiter(tableId, req.user);
	res.status(200).json(result);
});
