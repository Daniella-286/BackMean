const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    
    if (!token) {
        return res.status(403).json({ message: "Accès refusé. Aucun token fourni." });
    }

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.user = decoded; // On stocke les infos du user dans req.user
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide." });
    }
};

module.exports = verifyToken;
