import Reservation from "./reservation.model.js";
import Table from "../table/table.model.js";
import { createHttpError } from "../../common/httpError.js";

export const RESERVATION_HOLD_MINUTES = 60;

export const buildReservationStart = (reservationDate, startTime) => {
	const d = new Date(reservationDate);
	if (Number.isNaN(d.getTime())) return null;
	const y = d.getUTCFullYear();
	const m = d.getUTCMonth();
	const day = d.getUTCDate();
	const [hh = 0, mm = 0] = String(startTime || "0:0").split(":").map(n => Number(n) || 0);
	return new Date(y, m, day, hh, mm, 0, 0);
};

export const buildReservationEnd = (reservationDate, endTime) => buildReservationStart(reservationDate, endTime);

export const createReservation = async (payload, user) => {
	const { reservationDate, startTime, endTime, numberOfGuests } = payload;
	const userId = user?.userId;

	if (!userId) {
		throw createHttpError(401, "Brak poprawnych danych użytkownika w tokenie");
	}

	if (!reservationDate || !startTime || !endTime || !numberOfGuests) {
		throw createHttpError(400, "Brakuje wymaganych danych");
	}

	const newReservation = new Reservation({
		userId,
		tableId: null,
		reservationDate,
		startTime,
		endTime,
		numberOfGuests,
		status: "pending"
	});

	const savedReservation = await newReservation.save();
	const populated = await populateReservation(Reservation.findById(savedReservation._id));
	return { message: "Rezerwacja została utworzona", data: populated };
};

export const getAllReservations = async () => {
	const reservations = await Reservation.find()
		.populate("userId", "email role")
		.populate("tableId", "tableNumber capacity");

	return { reservations };
};

export const getUserReservations = async (userId) => {
	const reservations = await Reservation.find({ userId })
		.populate("userId", "email role")
		.populate("tableId", "tableNumber capacity");

	return { reservations };
};

const findAvailableTable = async (numberOfGuests, reservationDate, startTime, endTime) => {
	const suitableTables = await Table.find({
		capacity: { $gte: numberOfGuests }
	});

	for (const table of suitableTables) {
		const overlappingReservations = await Reservation.find({
			tableId: table._id,
			reservationDate,
			status: { $in: ["accepted", "active"] },
			$or: [
				{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }
			]
		});

		if (!overlappingReservations.length) {
			return table;
		}
	}

	return null;
};

const populateReservation = (query) => query
	.populate("userId", "email role")
	.populate("tableId", "tableNumber capacity status waiter orderId");

export const updateReservationStatus = async (id, payload) => {
	const { status } = payload;

	if (!status) {
		throw createHttpError(400, "Status jest wymagany");
	}

	const reservation = await Reservation.findById(id);
	if (!reservation) {
		throw createHttpError(404, "Rezerwacja nie została znaleziona");
	}

	if (status === "accepted") {
		const table = await findAvailableTable(
			reservation.numberOfGuests,
			reservation.reservationDate,
			reservation.startTime,
			reservation.endTime
		);

		if (!table) {
			throw createHttpError(404, "Brak dostępnego stolika dla tej rezerwacji");
		}

		reservation.tableId = table._id;
		reservation.status = "accepted";
	} else if (status === "rejected" || status === "cancelled") {
		reservation.status = status;
		reservation.tableId = null;
	} else {
		reservation.status = status;
	}

	await reservation.save();

	const populated = await populateReservation(Reservation.findById(reservation._id));
	return { message: "Status rezerwacji został zaktualizowany", data: populated };
};

export const checkInReservation = async (id, user) => {
	const reservation = await Reservation.findById(id);
	if (!reservation) {
		throw createHttpError(404, "Rezerwacja nie została znaleziona");
	}
	if (reservation.status !== "accepted") {
		throw createHttpError(400, "Tylko zaakceptowana rezerwacja może być oznaczona jako 'klient przybył'");
	}
	if (!reservation.tableId) {
		throw createHttpError(400, "Rezerwacja nie ma przypisanego stolika");
	}

	reservation.status = "active";
	await reservation.save();

	const populated = await populateReservation(Reservation.findById(reservation._id));
	return { message: "Klient został oznaczony jako przybyły", data: populated };
};

export const completeReservation = async (id, user) => {
	const reservation = await Reservation.findById(id);
	if (!reservation) {
		throw createHttpError(404, "Rezerwacja nie została znaleziona");
	}
	if (reservation.status !== "active") {
		throw createHttpError(400, "Tylko rezerwację 'klient na miejscu' można ręcznie zakończyć");
	}
	reservation.status = "completed";
	await reservation.save();
	const populated = await populateReservation(Reservation.findById(reservation._id));
	return { message: "Rezerwacja została zakończona", data: populated };
};

export const completeActiveReservationForTable = async (tableId) => {
	if (!tableId) return null;
	const reservation = await Reservation.findOne({ tableId, status: "active" });
	if (!reservation) return null;
	reservation.status = "completed";
	await reservation.save();
	return reservation;
};

export const cancelReservation = async (id) => {
	const reservation = await Reservation.findById(id);

	if (!reservation) {
		throw createHttpError(404, "Rezerwacja nie znaleziona");
	}

	reservation.status = "cancelled";
	reservation.tableId = null;
	await reservation.save();

	const populated = await populateReservation(Reservation.findById(reservation._id));
	return { message: "Rezerwacja została anulowana", data: populated };
};

export const hardDeleteReservation = async (id) => {
	const reservation = await Reservation.findByIdAndDelete(id);
	if (!reservation) {
		throw createHttpError(404, 'Rezerwacja nie znaleziona');
	}
	return { message: 'Rezerwacja została trwale usunięta', data: reservation };
};

export const pruneReservations = async (days = 90) => {
	const cutoff = new Date();
	cutoff.setDate(cutoff.getDate() - Number(days));

	const result = await Reservation.deleteMany({ status: 'cancelled', updatedAt: { $lt: cutoff } });
	return { message: `Usunięto ${result.deletedCount} starych rezerwacji` };
};
