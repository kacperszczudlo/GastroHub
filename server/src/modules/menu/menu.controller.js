export const getAllMenuItems = async (req, res) => {
    try {
        res.status(200).json({ message: "Pobierz wszystkie pozycje menu" });
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
}

export const createMenuItem = async (req, res) => {
    try {
        res.status(201).json({ message: "Dodaj nową pozycję menu" });
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
}

export const updateMenuItem = async (req, res) => {
    try {
        res.status(200).json({ message: "Aktualizuj pozycję menu" });
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
}

export const deleteMenuItem = async (req, res) => {
    try {
        res.status(200).json({ message: "Usuń pozycję menu" });
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
}