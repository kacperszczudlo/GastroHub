import Table from "./table.model.js";

const createError = (status, message) => {
	const error = new Error(message);
	error.status = status;
	return error;
};

export const getAllTables = async () => {
	const tables = await Table.find();
	return { tables };
};

export const createTable = async ({ tableNumber, capacity }) => {
	if (!tableNumber || !capacity) {
		throw createError(400, "Numer i pojemność są wymagane");
	}

	const existingTable = await Table.findOne({ tableNumber });
	if (existingTable) {
		throw createError(400, `Stolik o numerze ${tableNumber} już istnieje`);
	}

	const newTable = new Table({ tableNumber, capacity });
	const savedTable = await newTable.save();
	return { message: "Stolik został utworzony", data: savedTable };
};

export const updateTable = async (id, payload) => {
	const updatedTable = await Table.findByIdAndUpdate(id, payload, { new: true });
	if (!updatedTable) {
		throw createError(404, "Stolik nie znaleziona");
	}

	return { message: "Stolik został zaktualizowany", data: updatedTable };
};

export const deleteTable = async (id) => {
	const deletedTable = await Table.findByIdAndDelete(id);
	if (!deletedTable) {
		throw createError(404, "Stolik nie znaleziona");
	}

	return { message: "Stolik został usunięty", data: deletedTable };
};