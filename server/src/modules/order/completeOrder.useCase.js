import { createHttpError } from "../../common/httpError.js";
import * as orderRepository from "./order.repository.js";
import * as tableRepository from "../table/table.repository.js";
import { closeActiveReservationForTable } from "../reservation/reservation.port.js";

export async function executeCompleteOrder(id) {
	const updatedOrder = await orderRepository.markOrderPaid(id);

	if (!updatedOrder) {
		throw createHttpError(404, "Zamówienie nie zostało znalezione");
	}

	if (updatedOrder.tableId) {
		const tableId = updatedOrder.tableId?._id || updatedOrder.tableId;
		await tableRepository.unlinkOrderFromTable(tableId);
		await closeActiveReservationForTable(tableId);
		console.log(`Order ${id} paid, table ${tableId} unlinked, active reservation closed if any`);
	}

	return { message: "Zamówienie zostało opłacone", data: updatedOrder };
}
