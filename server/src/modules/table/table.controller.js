import Table from "./table.model.js";

export const getAllTables = async (req, res) => {
    try{
        const tables = await Table.find();
        res.status(200).json({ tables });
    }
    catch (error) {
        res.status(500).json({ error: "Błąd serwera podczas pobierania stolików" });
    }
}

export const createTable = async (req, res) => {
    try{
        const { tableNumber, capacity } = req.body;
        if (!tableNumber || !capacity) {
            return res.status(400).json({ message: "Numer i pojemność są wymagane" });
        }

        const existingTable = await Table.findOne({ tableNumber });
        if (existingTable) {
            return res.status(400).json({ message: "Stolik o numerze ${tableNumber} już istnieje" });
        }
        
        const newTable = new Table({ tableNumber, capacity });
        const savedTable = await newTable.save();
        res.status(201).json({ message: "Stolik został utworzony", data: savedTable });
    }
    catch (error) {
        res.status(500).json({ error: "Błąd serwera podczas tworzenia stolika" });
    }
}

export const updateTable = async (req, res) => {
    try{
        const updatedTable = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTable) {
            return res.status(404).json({ message: "Stolik nie znaleziona" });
        }
        res.status(200).json({ message: "Stolik został zaktualizowany", data: updatedTable });
    }
    catch (error) {
        res.status(500).json({ error: "Błąd serwera podczas aktualizacji stolika" });
    }
}

export const deleteTable = async (req, res) => {
    try {
        const deletedTable = await Table.findByIdAndDelete(req.params.id);
        if (!deletedTable) {
            return res.status(404).json({ message: "Stolik nie znaleziona" });
        }
        res.status(200).json({ message: "Stolik został usunięty", data: deletedTable });
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera podczas usuwania stolika" });
    }
}