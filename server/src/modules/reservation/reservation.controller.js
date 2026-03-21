import Reservation from "./reservation.model.js";
import Table from "../table/table.model.js";

export const createAllReservations = async(req, res) => {
    try{
        const { reservationDate, startTime, endTime, numberOfGuests } = req.body;

        const userId = req.user.userId;

        if (!reservationDate || !startTime || !endTime || !numberOfGuests) {
            return res.status(400).json({ message: "Brakuje wymaganych danych" });
        }

        const suitableTables = await Table.find({
            capacity: { $gte: numberOfGuests },
        });

        if (suitableTables.length === 0) {
            return res.status(404).json({ message: "Brak dostępnych stolików dla podanej liczby gości" });
        }

        let assignedTableId = null;

        for (const table of suitableTables) {
            const overlappingReservations = await Reservation.find({
                tableId: table._id,
                reservationDate: reservationDate,
                $or: [
                    { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
                ]
            });

            if (!overlappingReservations.length) {
                assignedTableId = table._id;
                break;
            }
        }

        if (!assignedTableId) {
            return res.status(404).json({ message: "Brak dostępnych stolików dla podanego terminu" });
        }

        const newReservation = new Reservation({
            userId: userId,
            tableId: assignedTableId,
            reservationDate,
            startTime,
            endTime,
            numberOfGuests,
            status: "active"
        });

        const savedReservation = await newReservation.save();
        res.status(201).json({ message: "Rezerwacja została utworzona", data: savedReservation });
    }
    catch (error) {
        console.error("Błąd podczas tworzenia rezerwacji:", error);
        res.status(500).json({ error: "Błąd serwera", details: error.message });
    }
}

export const getAllReservations = async(req, res) => {
    try{
        const reservations = await Reservation.find()
            .populate("userId", "name email")
            .populate("tableId", "tableNumber capacity");
        res.status(200).json({ reservations });
    }
    catch (error) {
        console.error("Błąd podczas pobierania rezerwacji:", error);
        res.status(500).json({ error: "Błąd serwera", details: error.message });
    }
}

export const cancelReservation = async(req, res) => {
    try{
        const reservation = await Reservation.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });

        if (!reservation) {
            return res.status(404).json({ message: "Rezerwacja nie znaleziona" });
        }

        res.status(200).json({ message: "Rezerwacja została anulowana", data: reservation });
    }
    catch (error) {
        console.error("Błąd podczas anulowania rezerwacji:", error);
        res.status(500).json({ error: "Błąd serwera", details: error.message });
    }
}