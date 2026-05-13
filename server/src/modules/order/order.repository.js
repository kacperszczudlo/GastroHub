import Order from "./order.model.js";

const populateListQuery = (query) =>
	query
		.populate("userId", "email role")
		.populate("tableId", "tableNumber capacity status waiter orderId")
		.populate("items.menuItemId", "name price image description category");

export function findOpenOrderByTable(tableId) {
	return Order.findOne({ tableId, status: "open" });
}

export function findOrderById(id) {
	return Order.findById(id);
}

export function saveOrderDocument(doc) {
	return doc.save();
}

export async function insertOrder(payload) {
	const doc = new Order(payload);
	return doc.save();
}

export function findAllOrdersWithPopulates() {
	return populateListQuery(Order.find());
}

export function findOpenOrdersWithPopulates() {
	return populateListQuery(Order.find({ status: "open" }));
}

export function findOpenByTableWithPopulate(tableId) {
	return Order.findOne({ tableId, status: "open" }).populate(
		"items.menuItemId",
		"name price image description category"
	);
}

export function markOrderPaid(id) {
	return Order.findByIdAndUpdate(id, { status: "paid" }, { new: true });
}

export function updateOrderStatusById(id, status) {
	return Order.findByIdAndUpdate(id, { status }, { new: true });
}
