import * as orderService from "./order.service.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
	const result = await orderService.createOrder(req.body, req.user);
	res.status(201).json(result);
});

export const getAllOrders = asyncHandler(async (req, res) => {
	const result = await orderService.getAllOrders();
	res.status(200).json(result);
});

export const getOpenOrders = asyncHandler(async (req, res) => {
	const result = await orderService.getOpenOrders();
	res.status(200).json(result);
});

export const getOpenOrderByTable = asyncHandler(async (req, res) => {
	const result = await orderService.getOpenOrderByTable(req.query.tableId);
	res.status(200).json(result);
});

export const updateOrderItems = asyncHandler(async (req, res) => {
	const result = await orderService.updateOrderItems(req.params.id, req.body);
	res.status(200).json(result);
});

export const completeOrder = asyncHandler(async (req, res) => {
	const result = await orderService.completeOrder(req.params.id);
	res.status(200).json(result);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
	const result = await orderService.updateOrderStatus(req.params.id, req.body.status);
	res.status(200).json(result);
});
