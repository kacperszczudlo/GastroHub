import Order from "../order/order.model.js";
import Reservation from "../reservation/reservation.model.js";
import {
	RESERVATION_HOLD_MINUTES,
	buildReservationStart,
	buildReservationEnd
} from "../reservation/reservation.service.js";

export function computeEffectiveStatus(table, { openOrders, reservations }, now = new Date()) {
	const tableId = table._id.toString();

	const hasOpenOrder = openOrders.some((o) => {
		const oid = o.tableId?._id || o.tableId;
		return oid && oid.toString() === tableId;
	});
	if (hasOpenOrder) return "occupied";

	const tableReservations = reservations.filter((r) => {
		const rid = r.tableId?._id || r.tableId;
		return rid && rid.toString() === tableId;
	});

	const hasActive = tableReservations.some((r) => r.status === "active");
	if (hasActive) return "occupied";

	const holdMs = RESERVATION_HOLD_MINUTES * 60 * 1000;
	const isUpcomingSoon = tableReservations.some((r) => {
		if (r.status !== "accepted") return false;
		const start = buildReservationStart(r.reservationDate, r.startTime);
		const end = buildReservationEnd(r.reservationDate, r.endTime);
		if (!start) return false;
		const diff = start.getTime() - now.getTime();
		const inHoldWindow = diff <= holdMs && diff >= 0;
		const inProgress = end
			? start.getTime() <= now.getTime() && now.getTime() <= end.getTime()
			: false;
		return inHoldWindow || inProgress;
	});
	if (isUpcomingSoon) return "reserved";

	return "available";
}

export async function decorateTablesWithStatus(tableDocs) {
	if (!tableDocs.length) return [];

	const tableIds = tableDocs.map((t) => t._id);

	const [openOrders, reservations] = await Promise.all([
		Order.find({ status: "open", tableId: { $in: tableIds } }).select("tableId"),
		Reservation.find({
			tableId: { $in: tableIds },
			status: { $in: ["accepted", "active"] }
		}).select("tableId status reservationDate startTime endTime")
	]);

	const now = new Date();
	return tableDocs.map((doc) => {
		const plain = doc.toObject ? doc.toObject() : { ...doc };
		const effective = computeEffectiveStatus(doc, { openOrders, reservations }, now);
		return { ...plain, status: effective };
	});
}
