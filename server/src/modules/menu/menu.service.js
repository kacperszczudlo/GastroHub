import MenuItem from "./menu.model.js";

const createError = (status, message) => {
	const error = new Error(message);
	error.status = status;
	return error;
};

export const getAllMenuItems = async () => {
	const items = await MenuItem.find();
	return { items };
};

export const createMenuItem = async ({ name, price, description, image, category, isAvailable }) => {
	if (!name || !price || !category) {
		throw createError(400, "Nazwa, cena i kategoria są wymagane");
	}

	const newMenuItem = new MenuItem({
		name,
		price,
		description,
		image,
		category,
		isAvailable: isAvailable !== undefined ? isAvailable : true
	});

	const savedItem = await newMenuItem.save();
	return { message: "Pozycja menu została utworzona", data: savedItem };
};

export const updateMenuItem = async (id, payload) => {
	const updatedItem = await MenuItem.findByIdAndUpdate(id, payload, { new: true });
	if (!updatedItem) {
		throw createError(404, "Pozycja menu nie znaleziona");
	}

	return { message: "Pozycja menu została zaktualizowana", data: updatedItem };
};

export const deleteMenuItem = async (id) => {
	const deletedItem = await MenuItem.findByIdAndDelete(id);
	if (!deletedItem) {
		throw createError(404, "Pozycja menu nie znaleziona");
	}

	return { message: "Pozycja menu została usunięta", data: deletedItem };
};
