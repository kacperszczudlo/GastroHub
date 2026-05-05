import Order from "./order.model.js";
import MenuItem from "../menu/menu.model.js";
import Table from "../table/table.model.js";

const createError = (status, message) => {
	const error = new Error(message);
	error.status = status;
	return error;
};

export const createOrder = async (payload, user) => {
	const { items, tableId, waiter } = payload;
	const userId = user?.userId;

	console.log('📦 createOrder called with:', { tableId, waiter, itemsCount: items?.length, userId });

	if (!userId) {
		throw createError(401, "Brak poprawnych danych użytkownika w tokenie");
	}

	if (!Array.isArray(items) || !items.length) {
		throw createError(400, "Brakuje wymaganych danych");
	}

	let totalPrice = 0;
	const normalizedItems = [];

	for (const item of items) {
		// accept a few possible keys from client: menuItemId, menuId, id
		const menuId = item.menuItemId || item.menuId || item.id;
		const quantity = item.quantity || item.qty || item.count;

		if (!menuId || !quantity) {
			throw createError(400, "Każda pozycja musi zawierać menuItemId i quantity");
		}

		const menuItem = await MenuItem.findById(menuId);
		if (!menuItem) {
			console.error('❌ MenuItem not found:', item.menuItemId);
			throw createError(404, "Jedna z pozycji menu nie została znaleziona");
		}

		normalizedItems.push({
			menuItemId: menuItem._id,
			quantity
		});
		totalPrice += Number(menuItem.price) * Number(quantity);
	}

	if (tableId) {
		console.log('🔍 Looking for table with ID:', tableId);
		const table = await Table.findById(tableId);
		if (!table) {
			console.error('❌ Table not found with ID:', tableId);
			throw createError(404, "Stolik nie został znaleziony");
		}
		console.log('✅ Table found:', table.tableNumber);
	}

	const existingOpenOrder = await Order.findOne({
		tableId: tableId || null,
		status: "open"
	});

	if (existingOpenOrder) {
		console.error('❌ Open order already exists for table:', tableId);
		throw createError(400, "Dla tego stolika istnieje już otwarte zamówienie");
	}

	const newOrder = new Order({
		userId,
		tableId: tableId || null,
		waiter: waiter || null,
		items: normalizedItems,
		totalPrice,
		status: "open"
	});

	const savedOrder = await newOrder.save();
	console.log('✅ Order saved:', savedOrder._id);
		// If order is attached to a table, mark table as occupied and store orderId there
		if (savedOrder.tableId) {
			try {
				await Table.findByIdAndUpdate(savedOrder.tableId, { status: 'occupied', orderId: savedOrder._id });
				console.log(`✅ Table ${savedOrder.tableId} set to occupied and linked to order ${savedOrder._id}`);
			} catch (err) {
				console.error('❌ Failed to link order to table:', err);
			}
		}
	return { message: "Zamówienie zostało utworzone", data: savedOrder };
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

	// Jeśli zamówienie jest przypisane do stolika, zmień jego status na 'free'
	if (updatedOrder.tableId) {
		const tableId = updatedOrder.tableId?._id || updatedOrder.tableId;
		await Table.findByIdAndUpdate(tableId, { status: "available", orderId: null });
		console.log(`✅ Order ${id} marked as paid, table ${updatedOrder.tableId} set to free`);
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
