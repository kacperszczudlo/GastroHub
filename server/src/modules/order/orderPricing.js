import MenuItem from "../menu/menu.model.js";
import { createHttpError } from "../../common/httpError.js";

export async function normalizeAndPriceOrderItems(items) {
	if (!Array.isArray(items) || !items.length) {
		throw createHttpError(400, "Brakuje pozycji zamówienia");
	}

	let totalPrice = 0;
	const normalized = [];
	for (const item of items) {
		const menuId = item.menuItemId || item.menuId || item.id;
		const quantity = item.quantity || item.qty || item.count;

		if (!menuId || !quantity) {
			throw createHttpError(400, "Każda pozycja musi zawierać menuItemId i quantity");
		}

		const menuItem = await MenuItem.findById(menuId);
		if (!menuItem) {
			throw createHttpError(404, "Jedna z pozycji menu nie została znaleziona");
		}

		normalized.push({ menuItemId: menuItem._id, quantity });
		totalPrice += Number(menuItem.price) * Number(quantity);
	}

	return { normalized, totalPrice };
}
