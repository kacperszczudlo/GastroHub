import * as reservationService from "./reservation.service.js";

export const createAllReservations = async(req, res) => {
    try{
        const result = await reservationService.createReservation(req.body, req.user);
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Błąd podczas tworzenia rezerwacji:", error);
        res.status(error.status || 500).json({ error: "Błąd serwera", details: error.message });
    }
}

export const getAllReservations = async(req, res) => {
    try{
        const result = await reservationService.getAllReservations();
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Błąd podczas pobierania rezerwacji:", error);
        res.status(error.status || 500).json({ error: "Błąd serwera", details: error.message });
    }
}

export const updateReservationStatus = async(req, res) => {
    try{
        const result = await reservationService.updateReservationStatus(req.params.id, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Błąd podczas aktualizacji rezerwacji:", error);
        res.status(error.status || 500).json({ error: "Błąd serwera", details: error.message });
    }
}

export const cancelReservation = async(req, res) => {
    try{
        const result = await reservationService.cancelReservation(req.params.id);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Błąd podczas anulowania rezerwacji:", error);
        res.status(error.status || 500).json({ error: "Błąd serwera", details: error.message });
    }
}

export const getUserReservations = async(req, res) => {
    try{
        const result = await reservationService.getUserReservations(req.user.userId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Błąd podczas pobierania rezerwacji użytkownika:", error);
        res.status(error.status || 500).json({ error: "Błąd serwera", details: error.message });
    }
}

export const hardDeleteReservation = async (req, res) => {
    try {
        const result = await reservationService.hardDeleteReservation(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        console.error('Błąd podczas trwałego usuwania rezerwacji:', error);
        res.status(error.status || 500).json({ error: 'Błąd serwera', details: error.message });
    }
}

export const pruneReservations = async (req, res) => {
    try {
        const { days } = req.body;
        const result = await reservationService.pruneReservations(days || 90);
        res.status(200).json(result);
    } catch (error) {
        console.error('Błąd podczas prune rezerwacji:', error);
        res.status(error.status || 500).json({ error: 'Błąd serwera', details: error.message });
    }
}