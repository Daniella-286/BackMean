const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        // console.log("authHeader:", authHeader);

        if (!authHeader) {
            return res.status(401).json({ message: 'Accès refusé. Aucun token fourni.' });
        }

        const tokenParts = authHeader.split(" ");
        // console.log("tokenParts:", tokenParts);
        
        if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
            return res.status(400).json({ message: "Format du token invalide" });
        }

        const token = tokenParts[1];
        // console.log("token:", token);

        const jwtSecret = process.env.JWT_SECRET;
        // console.log("Clé JWT chargée :", jwtSecret);

        if (!jwtSecret) {
            return res.status(500).json({ message: "Erreur serveur : clé JWT non définie" });
        }

        const verified = jwt.verify(token, jwtSecret);
        // console.log("verified:", verified);

        req.user = verified;
        next();
    } catch (error) {
        console.error("Erreur JWT:", error);
        return res.status(403).json({ message: 'Token invalide ou expiré' });
    }
};

module.exports = verifyToken;
