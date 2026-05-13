import Table from "./table.model.js";
import { createHttpError } from "../../common/httpError.js";
import { decorateTablesWithStatus } from "./tableStatusResolver.js";

export const getAllTables = async () => {
	const tableDocs = await Table.find();
	const tables = await decorateTablesWithStatus(tableDocs);
	return { tables };
};

export const createTable = async ({ tableNumber, capacity }) => {
	if (!tableNumber || !capacity) {
		throw createHttpError(400, "Numer i pojemność są wymagane");
	}

	const existingTable = await Table.findOne({ tableNumber });
	if (existingTable) {
		throw createHttpError(400, `Stolik o numerze ${tableNumber} już istnieje`);
	}

	const newTable = new Table({ tableNumber, capacity });
	const savedTable = await newTable.save();
	return { message: "Stolik został utworzony", data: savedTable };
};

export const updateTable = async (id, payload, user = null) => {
	const sanitized = { ...payload };
	delete sanitized.status;
	delete sanitized.orderId;

	if (user && user.role === 'waiter') {
		const allowed = {};
		if (typeof sanitized.x !== 'undefined') allowed.x = sanitized.x;
		if (typeof sanitized.y !== 'undefined') allowed.y = sanitized.y;
		const updatedTable = await Table.findByIdAndUpdate(id, allowed, { new: true });
		if (!updatedTable) {
			throw createHttpError(404, "Stolik nie znaleziona");
		}
		const [decorated] = await decorateTablesWithStatus([updatedTable]);
		return { message: "Stolik został zaktualizowany", data: decorated };
	}

	const updatedTable = await Table.findByIdAndUpdate(id, sanitized, { new: true });
	if (!updatedTable) {
		throw createHttpError(404, "Stolik nie znaleziona");
	}

	const [decorated] = await decorateTablesWithStatus([updatedTable]);
	return { message: "Stolik został zaktualizowany", data: decorated };
};

export const assignWaiter = async (id, waiter, user) => {
	if (user?.role === 'waiter') {
		if (waiter && waiter !== user.email) {
			throw createHttpError(403, 'Nie masz uprawnień do przypisania innego kelnera');
		}
		waiter = user.email;
	}

	const updated = await Table.findByIdAndUpdate(id, { waiter }, { new: true });
	if (!updated) {
		throw createHttpError(404, 'Stolik nie został znaleziony');
	}

	const [decorated] = await decorateTablesWithStatus([updated]);
	return { message: 'Przypisanie kelnera zaktualizowane', data: decorated };
};

export const unassignWaiter = async (id, user) => {
	const table = await Table.findById(id);
	if (!table) {
		throw createHttpError(404, 'Stolik nie został znaleziony');
	}

	if (user?.role === 'waiter' && table.waiter !== user.email) {
		throw createHttpError(403, 'Nie możesz odpiąć kelnera z tego stolika');
	}

	const updated = await Table.findByIdAndUpdate(id, { waiter: null }, { new: true });
	const [decorated] = await decorateTablesWithStatus([updated]);
	return { message: 'Kelner został odpięty od stolika', data: decorated };
};

export const deleteTable = async (id) => {
	const deletedTable = await Table.findByIdAndDelete(id);
	if (!deletedTable) {
		throw createHttpError(404, "Stolik nie znaleziona");
	}

	return { message: "Stolik został usunięty", data: deletedTable };
};

export const getTableById = async (id) => {
	const table = await Table.findById(id);
	if (!table) {
		throw createHttpError(404, "Stolik nie znaleziona");
	}
	const [decorated] = await decorateTablesWithStatus([table]);
	return { data: decorated };
};
