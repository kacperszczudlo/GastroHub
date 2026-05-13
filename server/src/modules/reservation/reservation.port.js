import { completeActiveReservationForTable as completeActiveReservationForTableImpl } from "./reservation.service.js";

export function closeActiveReservationForTable(tableId) {
	return completeActiveReservationForTableImpl(tableId);
}
