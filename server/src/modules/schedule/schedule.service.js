import Schedule from "./schedule.model.js";
import { createHttpError } from "../../common/httpError.js";

export const getScheduleByWaiter = async (waiterEmail) => {
    const schedules = await Schedule.find({ waiter: waiterEmail }).sort({ date: 1 });
    return { schedules };
};

export const getAllSchedules = async () => {
    const schedules = await Schedule.find().sort({ date: 1 });
    return { schedules };
};

export const createSchedule = async ({ waiter, date, shift }, user = null) => {
    if (user && user.role === 'waiter') {
        waiter = user.email;
    }

    if (!waiter || !date || !shift) {
        throw createHttpError(400, "Email kelnera, data i zmiana są wymagane");
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        throw createHttpError(400, "Nieprawidłowa data");
    }

    if (!['morning', 'afternoon', 'evening'].includes(shift)) {
        throw createHttpError(400, "Zmiana musi być: morning, afternoon lub evening");
    }

    const existing = await Schedule.findOne({ waiter, date: dateObj, shift });
    if (existing) {
        const shiftLabel =
            shift === "morning"
                ? "poranną"
                : shift === "afternoon"
                  ? "popołudniową"
                  : shift === "evening"
                    ? "wieczorną"
                    : shift;
        throw createHttpError(
            400,
            `Masz już zaplanowaną ${shiftLabel} zmianę na ten dzień. Wybierz inną datę lub inną zmianę.`
        );
    }

    const newSchedule = new Schedule({ waiter, date: dateObj, shift });
    const saved = await newSchedule.save();
    return { message: "Grafik został dodany", data: saved };
};

export const updateSchedule = async (id, payload) => {
    const updated = await Schedule.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) {
        throw createHttpError(404, "Grafik nie znaleziony");
    }
    return { message: "Grafik został zaktualizowany", data: updated };
};

export const deleteSchedule = async (id) => {
    if (!id) {
        throw createHttpError(400, 'Id grafiku jest wymagane');
    }
    const deleted = await Schedule.findByIdAndDelete(id);
    if (!deleted) {
        throw createHttpError(404, "Grafik nie znaleziony");
    }
    return { message: "Grafik został usunięty", data: deleted };
};
