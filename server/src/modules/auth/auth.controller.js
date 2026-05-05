import * as authService from "./auth.service.js";

export const registerUser = async(req, res) => {
    try {
        const result = await authService.registerUser(req.body);
        res.status(201).json(result);

    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas rejestracji" });
    }
}

export const loginUser = async(req, res) => {
    try {
        const result = await authService.loginUser(req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas logowania" });
    }
}

export const getWaiters = async(req, res) => {
    try {
        const result = await authService.getWaiters();
        res.status(200).json(result);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas pobierania listy kelnerów" });
    }
}