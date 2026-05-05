import * as scheduleService from "./schedule.service.js";

export const getScheduleByWaiter = async (req, res) => {
    try {
        const { waiter } = req.query;
        if (!waiter) {
            return res.status(400).json({ error: "Email kelnera jest wymagany" });
        }
        const result = await scheduleService.getScheduleByWaiter(waiter);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd pobierania grafiku" });
    }
};

export const getAllSchedules = async (req, res) => {
    try {
        const result = await scheduleService.getAllSchedules();
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd pobierania grafiów" });
    }
};

export const createSchedule = async (req, res) => {
    try {
        const result = await scheduleService.createSchedule(req.body, req.user);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd tworzenia grafiku" });
    }
};

export const updateSchedule = async (req, res) => {
    try {
        const result = await scheduleService.updateSchedule(req.params.id, req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd aktualizacji grafiku" });
    }
};

export const deleteSchedule = async (req, res) => {
    try {
        const result = await scheduleService.deleteSchedule(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd usuwania grafiku" });
    }
};
