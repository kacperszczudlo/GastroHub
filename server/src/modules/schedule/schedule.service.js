import Schedule from "./schedule.model.js";

const createError = (status, message) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

export const getScheduleByWaiter = async (waiterEmail) => {
    const schedules = await Schedule.find({ waiter: waiterEmail }).sort({ date: 1 });
    return { schedules };
};

export const getAllSchedules = async () => {
    const schedules = await Schedule.find().sort({ date: 1 });
    return { schedules };
};

export const createSchedule = async ({ waiter, date, shift }, user = null) => {
    // If a waiter creates, force waiter email to be their own
    if (user && user.role === 'waiter') {
        waiter = user.email;
    }

    if (!waiter || !date || !shift) {
        throw createError(400, "Email kelnera, data i zmiana są wymagane");
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
        throw createError(400, "Nieprawidłowa data");
    }

    if (!['morning', 'afternoon', 'evening'].includes(shift)) {
        throw createError(400, "Zmiana musi być: morning, afternoon lub evening");
    }

    const existing = await Schedule.findOne({ waiter, date: dateObj, shift });
    if (existing) {
        throw createError(400, `Kelner ma już zaplanowaną zmianę ${shift} na ten dzień`);
    }

    const newSchedule = new Schedule({ waiter, date: dateObj, shift });
    const saved = await newSchedule.save();
    return { message: "Grafik został dodany", data: saved };
};

export const updateSchedule = async (id, payload) => {
    const updated = await Schedule.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) {
        throw createError(404, "Grafik nie znaleziony");
    }
    return { message: "Grafik został zaktualizowany", data: updated };
};

export const deleteSchedule = async (id) => {
    if (!id) {
        throw createError(400, 'Id grafiku jest wymagane');
    }
    const deleted = await Schedule.findByIdAndDelete(id);
    if (!deleted) {
        throw createError(404, "Grafik nie znaleziony");
    }
    return { message: "Grafik został usunięty", data: deleted };
};
