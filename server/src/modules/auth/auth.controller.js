export const registerUser = async(req, res) => {
    try {
        res.status(201).json({ message: "Zarejestruj nowego użytkownika" });
    }
    catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
}

export const loginUser = async(req, res) => {
    try {
        res.status(200).json({ message: "Zaloguj użytkownika" });
    }
    catch (error) {
        res.status(500).json({ error: "Błąd serwera" });
    }
}