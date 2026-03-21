import * as orderService from "./order.service.js";

export const createOrder = async (req, res) => {
    try {
        const result = await orderService.createOrder(req.body, req.user);
        res.status(201).json(result);
    } catch (error) {
        console.error("Błąd podczas tworzenia zamówienia:", error);
        res.status(error.status || 500).json({ error: "Błąd serwera podczas tworzenia zamówienia", details: error.message });
    }
}

export const getAllOrders = async (req, res) => {
    try {
        const result = await orderService.getAllOrders();
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas pobierania zamówień" });
    }
}


export const updateOrderStatus = async (req, res) => {
    try {
        const result = await orderService.updateOrderStatus(req.params.id, req.body.status);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || "Błąd serwera podczas aktualizacji statusu zamówienia" });
    }
}