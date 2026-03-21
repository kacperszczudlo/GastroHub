import Order from "./order.model.js";

const createError = (status, message) => {
	const error = new Error(message);
	error.status = status;
	return error;
};

export const createOrder = async (payload, user) => {
	const { items, totalPrice } = payload;
	const userId = user?.userId;

	if (!userId) {
		throw createError(401, "Brak poprawnych danych użytkownika w tokenie");
	}

	if (!Array.isArray(items) || !items.length || totalPrice === undefined) {
		throw createError(400, "Brakuje wymaganych danych");
	}

	const invalidItem = items.find((item) => !item.menuItemId || !item.quantity);
	if (invalidItem) {
		throw createError(400, "Każda pozycja musi zawierać menuItemId i quantity");
	}

	const newOrder = new Order({
		userId,
		items,
		totalPrice
	});

	const savedOrder = await newOrder.save();
	return { message: "Zamówienie zostało utworzone", data: savedOrder };
};

export const getAllOrders = async () => {
	const orders = await Order.find()
		.populate("userId", "email role")
		.populate("items.menuItemId", "name price");

	return { orders };
};

export const updateOrderStatus = async (id, status) => {
	if (!status) {
		throw createError(400, "Status jest wymagany");
	}

	const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
	if (!updatedOrder) {
		throw createError(404, "Zamówienie nie znaleziona");
	}

	return { message: "Status zamówienia został zaktualizowany", data: updatedOrder };
};
