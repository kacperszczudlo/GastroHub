import Order from "./order.model.js";

export const createOrder = async (req, res) => {
    try {
        const { items, totalPrice } = req.body;
        const userId = req.user.userId;

        if (!items || !totalPrice) {
            return res.status(400).json({ message: "Brakuje wymaganych danych" });
        }

        const newOrder = new Order({
            userId,
            items,
            totalPrice
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({ message: "Zamówienie zostało utworzone", data: savedOrder });
    } catch (error) {
        console.error("Błąd podczas tworzenia zamówienia:", error);
        res.status(500).json({ error: "Błąd serwera podczas tworzenia zamówienia", details: error.message });
    }
}

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("userId", "name email")
            .populate("items.menuItemId", "name price");
        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera podczas pobierania zamówień" });
    }
}


export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ message: "Zamówienie nie znaleziona" });
        }
        res.status(200).json({ message: "Status zamówienia został zaktualizowany", data: updatedOrder });
    } catch (error) {
        res.status(500).json({ error: "Błąd serwera podczas aktualizacji statusu zamówienia" });
    }
}