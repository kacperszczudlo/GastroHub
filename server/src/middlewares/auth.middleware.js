import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
    try{
        let token = req.headers.authorization;
        if (!token || !token.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Brak tokenu autoryzacyjnego" });
        }
        token = token.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Nieprawidłowy token autoryzacyjny" });
    }
}

export const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Brak uprawnień do wykonania tej akcji" });
        }
        next();
    }
}