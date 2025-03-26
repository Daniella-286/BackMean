const checkManagerRole = (req, res, next) => {
    if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas autorisé à accéder à cette ressource manager.' });
    }
    next();
};

const checkMecanicienRole = (req, res, next) => {
    if (req.user.role !== 'mecanicien') {
        return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas autorisé à accéder à cette ressource de mecanicien.' });
    }
    next();
};

module.exports = { checkManagerRole , checkMecanicienRole };
