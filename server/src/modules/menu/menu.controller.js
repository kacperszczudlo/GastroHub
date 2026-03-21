import MenuItem from "./menu.model.js";

export const getAllMenuItems = async (req, res) => {
    try {
        const items = await MenuItem.find();
        res.status(200).json({ items });
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
}

export const createMenuItem = async (req, res) => {
    
    try{
        const { name, price, description, category, isAvailable } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ message: "Nazwa, cena i kategoria są wymagane" });
        }

        const newMenuItem = new MenuItem({
            name,
            price,
            description,
            category,
            isAvailable: isAvailable !== undefined ? isAvailable : true
        });

        const savedItem = await newMenuItem.save();
        res.status(201).json({ message: "Pozycja menu została utworzona", data: savedItem });
    }
    catch (error) {
        res.status(500).json({ error: "Błąd serwera podczas tworzenia pozycji menu"});
    }
}

export const updateMenuItem = async (req, res) => {
    try{
        const updatedItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: "Pozycja menu nie znaleziona" });
        }
        res.status(200).json({ message: "Pozycja menu została zaktualizowana", data: updatedItem });
    }
    catch (error) {
        res.status(500).json({ error: "Błąd serwera podczas aktualizacji pozycji menu" });
    }
}

export const deleteMenuItem = async (req, res) => {
    try {
        const deletedItem = await MenuItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: "Pozycja menu nie znaleziona" });
        }
        res.status(200).json({ message: "Pozycja menu została usunięta", data: deletedItem });
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera podczas usuwania pozycji menu" });
    }
}