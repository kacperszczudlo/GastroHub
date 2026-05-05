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

export const updateTable = async (id, payload, user = null) => {
	// If caller is waiter, restrict which fields they can change
	if (user && user.role === 'waiter') {
		const allowed = {};
		if (payload.status) allowed.status = payload.status;
		if (typeof payload.x !== 'undefined') allowed.x = payload.x;
		if (typeof payload.y !== 'undefined') allowed.y = payload.y;
		// prevent waiter changing waiter assignment or orderId or number/capacity
		const updatedTable = await Table.findByIdAndUpdate(id, allowed, { new: true });
		if (!updatedTable) {
			throw createError(404, "Stolik nie znaleziona");
		}
		return { message: "Stolik został zaktualizowany", data: updatedTable };
	}

	const updatedTable = await Table.findByIdAndUpdate(id, payload, { new: true });
	if (!updatedTable) {
		throw createError(404, "Stolik nie znaleziona");
	}

	return { message: "Stolik został zaktualizowany", data: updatedTable };
};

// allow role-aware assignment of waiter to a table
export const assignWaiter = async (id, waiter, user) => {
	// only admin can assign arbitrary waiter; waiter role can only assign themselves
	if (user?.role === 'waiter') {
		// ensure waiter cannot assign someone else
		if (waiter && waiter !== user.email) {
			throw createError(403, 'Nie masz uprawnień do przypisania innego kelnera');
		}
		waiter = user.email;
	}

	const updated = await Table.findByIdAndUpdate(id, { waiter }, { new: true });
	if (!updated) {
		throw createError(404, 'Stolik nie został znaleziony');
	}

	return { message: 'Przypisanie kelnera zaktualizowane', data: updated };
};

export const unassignWaiter = async (id, user) => {
	const table = await Table.findById(id);
	if (!table) {
		throw createError(404, 'Stolik nie został znaleziony');
	}

	if (user?.role === 'waiter' && table.waiter !== user.email) {
		throw createError(403, 'Nie możesz odpiąć kelnera z tego stolika');
	}

	const updated = await Table.findByIdAndUpdate(id, { waiter: null }, { new: true });
	return { message: 'Kelner został odpięty od stolika', data: updated };
};

export const deleteTable = async (id) => {
	const deletedTable = await Table.findByIdAndDelete(id);
	if (!deletedTable) {
		throw createError(404, "Stolik nie znaleziona");
	}

	return { message: "Stolik został usunięty", data: deletedTable };
};

export const getTableById = async (id) => {
	const table = await Table.findById(id);
	if (!table) {
		throw createError(404, "Stolik nie znaleziona");
	}
	return { data: table };
};