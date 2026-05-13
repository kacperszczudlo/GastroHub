import Table from "./table.model.js";

export function findTableById(id) {
	return Table.findById(id);
}

export function linkOrderToTable(tableId, orderId) {
	return Table.findByIdAndUpdate(tableId, { orderId }, { new: true });
}

export function unlinkOrderFromTable(tableId) {
	return Table.findByIdAndUpdate(tableId, { orderId: null });
}
