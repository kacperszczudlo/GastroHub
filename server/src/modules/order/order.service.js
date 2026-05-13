import { createHttpError } from "../../common/httpError.js";
import { normalizeAndPriceOrderItems } from "./orderPricing.js";
import * as orderRepository from "./order.repository.js";
import * as tableRepository from "../table/table.repository.js";
import { executeCompleteOrder } from "./completeOrder.useCase.js";

export const createOrder = async (payload, user) => {
	const { items, tableId, waiter } = payload;
	const userId = user?.userId;

	console.log("createOrder", { tableId, waiter, itemsCount: items?.length, userId });

	if (!userId) {
		throw createHttpError(401, "Brak poprawnych danych użytkownika w tokenie");
	}

	const { normalized, totalPrice } = await normalizeAndPriceOrderItems(items);

	if (tableId) {
		const table = await tableRepository.findTableById(tableId);
		if (!table) {
			throw createHttpError(404, "Stolik nie został znaleziony");
		}
	}

	if (tableId) {
		const existingOpenOrder = await orderRepository.findOpenOrderByTable(tableId);
		if (existingOpenOrder) {
			console.log("Open order exists for table, replacing items:", existingOpenOrder._id);
			existingOpenOrder.items = normalized;
			existingOpenOrder.totalPrice = totalPrice;
			if (waiter) existingOpenOrder.waiter = waiter;
			const saved = await orderRepository.saveOrderDocument(existingOpenOrder);
			await tableRepository.linkOrderToTable(tableId, saved._id);
			return { message: "Zamówienie zostało zaktualizowane", data: saved };
		}
	}

	const savedOrder = await orderRepository.insertOrder({
		userId,
		tableId: tableId || null,
		waiter: waiter || null,
		items: normalized,
		totalPrice,
		status: "open"
	});
	console.log("Order saved:", savedOrder._id);

	if (savedOrder.tableId) {
		try {
			await tableRepository.linkOrderToTable(savedOrder.tableId, savedOrder._id);
			console.log(`Table ${savedOrder.tableId} linked to order ${savedOrder._id}`);
		} catch (err) {
			console.error("Failed to link order to table:", err);
		}
	}
	return { message: "Zamówienie zostało utworzone", data: savedOrder };
};

export const updateOrderItems = async (id, payload) => {
	const { items, waiter } = payload;
	const order = await orderRepository.findOrderById(id);
	if (!order) {
		throw createHttpError(404, "Zamówienie nie zostało znalezione");
	}
	if (order.status !== "open") {
		throw createHttpError(400, "Można edytować wyłącznie otwarte zamówienia");
	}

	const { normalized, totalPrice } = await normalizeAndPriceOrderItems(items);
	order.items = normalized;
	order.totalPrice = totalPrice;
	if (typeof waiter !== "undefined") order.waiter = waiter || null;
	const saved = await orderRepository.saveOrderDocument(order);
	return { message: "Pozycje zamówienia zostały zaktualizowane", data: saved };
};

export const getAllOrders = async () => {
	const orders = await orderRepository.findAllOrdersWithPopulates();
	return { orders };
};

export const getOpenOrders = async () => {
	try {
		const orders = await orderRepository.findOpenOrdersWithPopulates();
		console.log("Found open orders count:", orders.length);
		return { orders };
	} catch (err) {
		console.error("Error fetching open orders:", err.message, err.stack);
		throw err;
	}
};

export const getOpenOrderByTable = async (tableId) => {
	if (!tableId) {
		throw createHttpError(400, "Id stolika jest wymagane");
	}

	const order = await orderRepository.findOpenByTableWithPopulate(tableId);
	return { data: order };
};

export const completeOrder = (id) => executeCompleteOrder(id);

export const updateOrderStatus = async (id, status) => {
	if (!status) {
		throw createHttpError(400, "Status jest wymagany");
	}

	const updatedOrder = await orderRepository.updateOrderStatusById(id, status);
	if (!updatedOrder) {
		throw createHttpError(404, "Zamówienie nie zostało znalezione");
	}

	return { message: "Status zamówienia został zaktualizowany", data: updatedOrder };
};
