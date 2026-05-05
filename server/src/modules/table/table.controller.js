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
    console.log('[TABLE ASSIGN] POST /tables/:id/assign', {
        tableId: req.params.id,
        waiter: req.body.waiter,
        userEmail: req.user?.email,
        userRole: req.user?.role
    });
    try {
        const tableId = req.params.id;
        const { waiter } = req.body;
        const result = await tableService.assignWaiter(tableId, waiter || null, req.user);
        console.log('[TABLE ASSIGN] Success:', result);
        res.status(200).json(result);
    } catch (error) {
        console.log('[TABLE ASSIGN] Error:', error.message);
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas przypisywania kelnera" });
    }
}

export const unassignWaiter = async (req, res) => {
    console.log('[TABLE UNASSIGN] POST /tables/:id/unassign', {
        tableId: req.params.id,
        userEmail: req.user?.email,
        userRole: req.user?.role
    });
    try {
        const tableId = req.params.id;
        const result = await tableService.unassignWaiter(tableId, req.user);
        console.log('[TABLE UNASSIGN] Success:', result);
        res.status(200).json(result);
    } catch (error) {
        console.log('[TABLE UNASSIGN] Error:', error.message);
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas odpinania kelnera" });
    }
}