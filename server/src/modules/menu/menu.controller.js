import * as menuService from "./menu.service.js";

export const getAllMenuItems = async (req, res) => {
    try {
        const result = await menuService.getAllMenuItems();
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera" });
    }
}

export const createMenuItem = async (req, res) => {
    try{
        const result = await menuService.createMenuItem(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas tworzenia pozycji menu" });
    }
}

export const updateMenuItem = async (req, res) => {
    try{
        const result = await menuService.updateMenuItem(req.params.id, req.body);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas aktualizacji pozycji menu" });
    }
}

export const deleteMenuItem = async (req, res) => {
    try {
        const result = await menuService.deleteMenuItem(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas usuwania pozycji menu" });
    }
}