export const getAllReservations = async(req, res) => {
    try {
        res.status(200).json({ message: "Pobierz wszystkie rezerwacje" });
    }
    catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
}

export const createReservation = async(req, res) => {
    try {
        res.status(201).json({ message: "Dodaj nową rezerwację" });
    }
    catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
}

export const cancelReservation = async(req, res) => {
    try {
        res.status(200).json({ message: "Anuluj rezerwację" });
    }
    catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
}