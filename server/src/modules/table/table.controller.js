import * as tableService from "./table.service.js";

export const getAllTables = async (req, res) => {
    try{
        const result = await tableService.getAllTables();
        res.status(200).json(result);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas pobierania stolików" });
    }
}

export const createTable = async (req, res) => {
    try{
        const result = await tableService.createTable(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas tworzenia stolika" });
    }
}

export const updateTable = async (req, res) => {
    try{
        const result = await tableService.updateTable(req.params.id, req.body, req.user);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas aktualizacji stolika" });
    }
}

export const deleteTable = async (req, res) => {
    try {
        const result = await tableService.deleteTable(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas usuwania stolika" });
    }
}

export const getTableById = async (req, res) => {
    try {
        const result = await tableService.getTableById(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas pobierania stolika" });
    }
}

export const assignWaiter = async (req, res) => {
    try {
        const tableId = req.params.id;
        const { waiter } = req.body;
        const result = await tableService.assignWaiter(tableId, waiter || null, req.user);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas przypisywania kelnera" });
    }
}

export const unassignWaiter = async (req, res) => {
    try {
        const tableId = req.params.id;
        const result = await tableService.unassignWaiter(tableId, req.user);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas odpinania kelnera" });
    }
}