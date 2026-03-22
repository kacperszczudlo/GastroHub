import Reservation from "./reservation.model.js";
import Table from "../table/table.model.js";

const createError = (status, message) => {
	const error = new Error(message);
	error.status = status;
	return error;
};

export const createReservation = async (payload, user) => {
	const { reservationDate, startTime, endTime, numberOfGuests } = payload;
	const userId = user?.userId;

	if (!userId) {
		throw createError(401, "Brak poprawnych danych użytkownika w tokenie");
	}

	if (!reservationDate || !startTime || !endTime || !numberOfGuests) {
		throw createError(400, "Brakuje wymaganych danych");
	}

	const suitableTables = await Table.find({
		capacity: { $gte: numberOfGuests }
	});

	if (suitableTables.length === 0) {
		throw createError(404, "Brak dostępnych stolików dla podanej liczby gości");
	}

	let assignedTableId = null;

	for (const table of suitableTables) {
		const overlappingReservations = await Reservation.find({
			tableId: table._id,
			reservationDate,
			$or: [
				{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }
			]
		});

		if (!overlappingReservations.length) {
			assignedTableId = table._id;
			break;
		}
	}

	if (!assignedTableId) {
		throw createError(404, "Brak dostępnych stolików dla podanego terminu");
	}

	const newReservation = new Reservation({
		userId,
		tableId: assignedTableId,
		reservationDate,
		startTime,
		endTime,
		numberOfGuests,
		status: "active"
	});

	const savedReservation = await newReservation.save();
	return { message: "Rezerwacja została utworzona", data: savedReservation };
};

export const getAllReservations = async () => {
	const reservations = await Reservation.find()
		.populate("userId", "email role")
		.populate("tableId", "tableNumber capacity");

	return { reservations };
};

export const cancelReservation = async (id) => {
	const reservation = await Reservation.findByIdAndUpdate(
		id,
		{ status: "cancelled" },
		{ new: true }
	);

	if (!reservation) {
		throw createError(404, "Rezerwacja nie znaleziona");
	}

	return { message: "Rezerwacja została anulowana", data: reservation };
};