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
        const result = await tableService.updateTable(req.params.id, req.body);
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