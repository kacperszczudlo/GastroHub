import Table from "./table.model.js";
import Order from "../order/order.model.js";
import Reservation from "../reservation/reservation.model.js";
import {
	RESERVATION_HOLD_MINUTES,
	buildReservationStart,
	buildReservationEnd
} from "../reservation/reservation.service.js";

const createError = (status, message) => {
	const error = new Error(message);
	error.status = status;
	return error;
};

// Compute the effective status for a given table, given the open orders and
// upcoming/active reservations that touch it. Order of precedence:
//   1. open order on this table   -> "occupied"
//   2. active reservation         -> "occupied"
//   3. accepted reservation that
//      starts within HOLD window  -> "reserved"
//   4. otherwise                  -> "available"
const computeEffectiveStatus = (table, { openOrders, reservations }, now = new Date()) => {
	const tableId = table._id.toString();

	const hasOpenOrder = openOrders.some(o => {
		const oid = (o.tableId?._id || o.tableId);
		return oid && oid.toString() === tableId;
	});
	if (hasOpenOrder) return "occupied";

	const tableReservations = reservations.filter(r => {
		const rid = (r.tableId?._id || r.tableId);
		return rid && rid.toString() === tableId;
	});

	const hasActive = tableReservations.some(r => r.status === "active");
	if (hasActive) return "occupied";

	const holdMs = RESERVATION_HOLD_MINUTES * 60 * 1000;
	const isUpcomingSoon = tableReservations.some(r => {
		if (r.status !== "accepted") return false;
		const start = buildReservationStart(r.reservationDate, r.startTime);
		const end = buildReservationEnd(r.reservationDate, r.endTime);
		if (!start) return false;
		const diff = start.getTime() - now.getTime();
		// Reserved if start is within the hold window (in the future) OR
		// the slot already started but hasn't been checked in yet (no-show grace).
		const inHoldWindow = diff <= holdMs && diff >= 0;
		const inProgress = end ? (start.getTime() <= now.getTime() && now.getTime() <= end.getTime()) : false;
		return inHoldWindow || inProgress;
	});
	if (isUpcomingSoon) return "reserved";

	return "available";
};

const decorateTablesWithStatus = async (tableDocs) => {
	if (!tableDocs.length) return [];

	const tableIds = tableDocs.map(t => t._id);

	const [openOrders, reservations] = await Promise.all([
		Order.find({ status: "open", tableId: { $in: tableIds } }).select("tableId"),
		Reservation.find({
			tableId: { $in: tableIds },
			status: { $in: ["accepted", "active"] }
		}).select("tableId status reservationDate startTime endTime")
	]);

	const now = new Date();
	return tableDocs.map(doc => {
		const plain = doc.toObject ? doc.toObject() : { ...doc };
		const effective = computeEffectiveStatus(doc, { openOrders, reservations }, now);
		return { ...plain, status: effective };
	});
};

export const getAllTables = async () => {
	const tableDocs = await Table.find();
	const tables = await decorateTablesWithStatus(tableDocs);
	return { tables };
};

export const createTable = async ({ tableNumber, capacity }) => {
	if (!tableNumber || !capacity) {
		throw createError(400, "Numer i pojemność są wymagane");
	}

	const existingTable = await Table.findOne({ tableNumber });
	if (existingTable) {
		throw createError(400, `Stolik o numerze ${tableNumber} już istnieje`);
	}

	const newTable = new Table({ tableNumber, capacity });
	const savedTable = await newTable.save();
	return { message: "Stolik został utworzony", data: savedTable };
};

export const updateTable = async (id, payload, user = null) => {
	// Effective table status is now derived from open orders / reservations,
	// so we ignore any client-provided "status" change here. Keep position and
	// admin-only fields editable.
	const sanitized = { ...payload };
	delete sanitized.status;
	delete sanitized.orderId;

	if (user && user.role === 'waiter') {
		const allowed = {};
		if (typeof sanitized.x !== 'undefined') allowed.x = sanitized.x;
		if (typeof sanitized.y !== 'undefined') allowed.y = sanitized.y;
		const updatedTable = await Table.findByIdAndUpdate(id, allowed, { new: true });
		if (!updatedTable) {
			throw createError(404, "Stolik nie znaleziona");
		}
		const [decorated] = await decorateTablesWithStatus([updatedTable]);
		return { message: "Stolik został zaktualizowany", data: decorated };
	}

	const updatedTable = await Table.findByIdAndUpdate(id, sanitized, { new: true });
	if (!updatedTable) {
		throw createError(404, "Stolik nie znaleziona");
	}

	const [decorated] = await decorateTablesWithStatus([updatedTable]);
	return { message: "Stolik został zaktualizowany", data: decorated };
};

// allow role-aware assignment of waiter to a table
export const assignWaiter = async (id, waiter, user) => {
	// only admin can assign arbitrary waiter; waiter role can only assign themselves
	if (user?.role === 'waiter') {
		// ensure waiter cannot assign someone else
		if (waiter && waiter !== user.email) {
			throw createError(403, 'Nie masz uprawnień do przypisania innego kelnera');
		}
		waiter = user.email;
	}

	const updated = await Table.findByIdAndUpdate(id, { waiter }, { new: true });
	if (!updated) {
		throw createError(404, 'Stolik nie został znaleziony');
	}

	const [decorated] = await decorateTablesWithStatus([updated]);
	return { message: 'Przypisanie kelnera zaktualizowane', data: decorated };
};

export const unassignWaiter = async (id, user) => {
	const table = await Table.findById(id);
	if (!table) {
		throw createError(404, 'Stolik nie został znaleziony');
	}

	if (user?.role === 'waiter' && table.waiter !== user.email) {
		throw createError(403, 'Nie możesz odpiąć kelnera z tego stolika');
	}

	const updated = await Table.findByIdAndUpdate(id, { waiter: null }, { new: true });
	const [decorated] = await decorateTablesWithStatus([updated]);
	return { message: 'Kelner został odpięty od stolika', data: decorated };
};

export const deleteTable = async (id) => {
	const deletedTable = await Table.findByIdAndDelete(id);
	if (!deletedTable) {
		throw createError(404, "Stolik nie znaleziona");
	}

	return { message: "Stolik został usunięty", data: deletedTable };
};

export const getTableById = async (id) => {
	const table = await Table.findById(id);
	if (!table) {
		throw createError(404, "Stolik nie znaleziona");
	}
	const [decorated] = await decorateTablesWithStatus([table]);
	return { data: decorated };
};
