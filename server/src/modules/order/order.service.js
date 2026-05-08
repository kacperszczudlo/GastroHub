import Order from "./order.model.js";
import MenuItem from "../menu/menu.model.js";
import Table from "../table/table.model.js";
import { completeActiveReservationForTable } from "../reservation/reservation.service.js";

const createError = (status, message) => {
	const error = new Error(message);
	error.status = status;
	return error;
};

// Normalize incoming items array, validate menu items, return [normalized, totalPrice].
const normalizeAndPriceItems = async (items) => {
	if (!Array.isArray(items) || !items.length) {
		throw createError(400, "Brakuje pozycji zamówienia");
	}

	let totalPrice = 0;
	const normalized = [];
	for (const item of items) {
		const menuId = item.menuItemId || item.menuId || item.id;
		const quantity = item.quantity || item.qty || item.count;

		if (!menuId || !quantity) {
			throw createError(400, "Każda pozycja musi zawierać menuItemId i quantity");
		}

		const menuItem = await MenuItem.findById(menuId);
		if (!menuItem) {
			throw createError(404, "Jedna z pozycji menu nie została znaleziona");
		}

		normalized.push({ menuItemId: menuItem._id, quantity });
		totalPrice += Number(menuItem.price) * Number(quantity);
	}

	return { normalized, totalPrice };
};

export const createOrder = async (payload, user) => {
	const { items, tableId, waiter } = payload;
	const userId = user?.userId;

	console.log('📦 createOrder called with:', { tableId, waiter, itemsCount: items?.length, userId });

	if (!userId) {
		throw createError(401, "Brak poprawnych danych użytkownika w tokenie");
	}

	const { normalized, totalPrice } = await normalizeAndPriceItems(items);

	if (tableId) {
		const table = await Table.findById(tableId);
		if (!table) {
			throw createError(404, "Stolik nie został znaleziony");
		}
	}

	// If an open order already exists for this table, merge items into it
	// instead of erroring out. This lets the staff add more dishes to an
	// existing tab (e.g. a customer ordering more drinks).
	if (tableId) {
		const existingOpenOrder = await Order.findOne({ tableId, status: "open" });
		if (existingOpenOrder) {
			console.log('ℹ️ Open order exists for table, replacing items:', existingOpenOrder._id);
			existingOpenOrder.items = normalized;
			existingOpenOrder.totalPrice = totalPrice;
			if (waiter) existingOpenOrder.waiter = waiter;
			const saved = await existingOpenOrder.save();
			await Table.findByIdAndUpdate(tableId, { orderId: saved._id });
			return { message: "Zamówienie zostało zaktualizowane", data: saved };
		}
	}

	const newOrder = new Order({
		userId,
		tableId: tableId || null,
		waiter: waiter || null,
		items: normalized,
		totalPrice,
		status: "open"
	});

	const savedOrder = await newOrder.save();
	console.log('✅ Order saved:', savedOrder._id);

	if (savedOrder.tableId) {
		try {
			await Table.findByIdAndUpdate(savedOrder.tableId, { orderId: savedOrder._id });
			console.log(`✅ Table ${savedOrder.tableId} linked to order ${savedOrder._id}`);
		} catch (err) {
			console.error('❌ Failed to link order to table:', err);
		}
	}
	return { message: "Zamówienie zostało utworzone", data: savedOrder };
};

export const updateOrderItems = async (id, payload) => {
	const { items, waiter } = payload;
	const order = await Order.findById(id);
	if (!order) {
		throw createError(404, "Zamówienie nie zostało znalezione");
	}
	if (order.status !== "open") {
		throw createError(400, "Można edytować wyłącznie otwarte zamówienia");
	}

	const { normalized, totalPrice } = await normalizeAndPriceItems(items);
	order.items = normalized;
	order.totalPrice = totalPrice;
	if (typeof waiter !== "undefined") order.waiter = waiter || null;
	const saved = await order.save();
	return { message: "Pozycje zamówienia zostały zaktualizowane", data: saved };
};

export const getAllOrders = async () => {
	const orders = await Order.find()
		.populate("userId", "email role")
		.populate("tableId", "tableNumber capacity status waiter orderId")
		.populate("items.menuItemId", "name price image description category");

	return { orders };
};

export const getOpenOrders = async () => {
	try {
		const orders = await Order.find({ status: "open" })
			.populate("userId", "email role")
			.populate("tableId", "tableNumber capacity status waiter orderId")
			.populate("items.menuItemId", "name price image description category");

		console.log('📦 Found open orders count:', orders.length);
		return { orders };
	} catch (err) {
		console.error('❌ Error fetching open orders:', err.message, err.stack);
		throw err;
	}
};

export const getOpenOrderByTable = async (tableId) => {
	if (!tableId) {
		throw createError(400, "Id stolika jest wymagane");
	}

	const order = await Order.findOne({ tableId, status: "open" })
		.populate("items.menuItemId", "name price image description category");

	return { data: order };
};

export const completeOrder = async (id) => {
	const updatedOrder = await Order.findByIdAndUpdate(
		id,
		{ status: "paid" },
		{ new: true }
	);

	if (!updatedOrder) {
		throw createError(404, "Zamówienie nie zostało znalezione");
	}

	if (updatedOrder.tableId) {
		const tableId = updatedOrder.tableId?._id || updatedOrder.tableId;
		// Detach the order from the table; effective status (free/reserved)
		// will be re-derived on the next read from upcoming reservations.
		await Table.findByIdAndUpdate(tableId, { orderId: null });
		// If the customer was a checked-in reservation, mark it completed so
		// the table doesn't keep showing as "active".
		await completeActiveReservationForTable(tableId);
		console.log(`✅ Order ${id} paid, table ${tableId} unlinked, active reservation closed if any`);
	}

	return { message: "Zamówienie zostało opłacone", data: updatedOrder };
};

export const updateOrderStatus = async (id, status) => {
	if (!status) {
		throw createError(400, "Status jest wymagany");
	}

	const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
	if (!updatedOrder) {
		throw createError(404, "Zamówienie nie zostało znalezione");
	}

	return { message: "Status zamówienia został zaktualizowany", data: updatedOrder };
};
