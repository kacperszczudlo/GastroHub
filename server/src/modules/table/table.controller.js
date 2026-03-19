export const getAllTables = async(req, res) => {
    try {
        res.status(200).json({ message: "Pobierz wszystkie stoliki" });
    }
    catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
}

export const updateTableStatus = async(req, res) => {
    try {
        res.status(200).json({ message: "Zaktualizuj status stolika" });
    }
    catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
}