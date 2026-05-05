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
		throw createError(400, "Status jest wymagany");
	}

	const reservation = await Reservation.findById(id);
	if (!reservation) {
		throw createError(404, "Rezerwacja nie została znaleziona");
	}

	if (status === "accepted") {
		const table = await findAvailableTable(
			reservation.numberOfGuests,
			reservation.reservationDate,
			reservation.startTime,
			reservation.endTime
		);

		if (!table) {
			throw createError(404, "Brak dostępnego stolika dla tej rezerwacji");
		}

		reservation.tableId = table._id;
		reservation.status = "accepted";
		
		// Zmień status stolika na 'reserved'
		await Table.findByIdAndUpdate(table._id, { status: "reserved" });
		console.log(`✅ Table ${table.tableNumber} set to reserved for reservation ${id}`);
	} else if (status === "rejected" || status === "cancelled") {
		reservation.status = status;

		if (reservation.tableId) {
			await Table.findByIdAndUpdate(reservation.tableId, { status: "available" });
			console.log(`✅ Table restored to available after ${status} reservation ${id}`);
		}

		reservation.tableId = null;
	} else {
		reservation.status = status;
	}

	await reservation.save();

	const populated = await populateReservation(Reservation.findById(reservation._id));
	return { message: "Status rezerwacji został zaktualizowany", data: populated };
};

export const cancelReservation = async (id) => {
	const reservation = await Reservation.findById(id);
	
	if (!reservation) {
		throw createError(404, "Rezerwacja nie znaleziona");
	}

	// Jeśli był przypisany stolik, przywróć go na 'free'
	if (reservation.tableId) {
		await Table.findByIdAndUpdate(reservation.tableId, { status: "available" });
		console.log(`✅ Table ${reservation.tableId} restored to available after cancelling reservation ${id}`);
	}

	reservation.status = "cancelled";
	await reservation.save();

	const populated = await populateReservation(Reservation.findById(reservation._id));
	return { message: "Rezerwacja została anulowana", data: populated };
};

export const hardDeleteReservation = async (id) => {
	const reservation = await Reservation.findByIdAndDelete(id);
	if (!reservation) {
		throw createError(404, 'Rezerwacja nie znaleziona');
	}
	// If a table was reserved for this reservation, free it
	if (reservation.tableId) {
		await Table.findByIdAndUpdate(reservation.tableId, { status: 'available' });
	}
	return { message: 'Rezerwacja została trwale usunięta', data: reservation };
};

// prune cancelled reservations older than `days` days (default 90)
export const pruneReservations = async (days = 90) => {
	const cutoff = new Date();
	cutoff.setDate(cutoff.getDate() - Number(days));

	const result = await Reservation.deleteMany({ status: 'cancelled', updatedAt: { $lt: cutoff } });
	return { message: `Usunięto ${result.deletedCount} starych rezerwacji` };
};