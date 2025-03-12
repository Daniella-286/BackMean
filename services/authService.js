const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Hacher un mot de passe
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Comparer un mot de passe avec un hash
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

const generateToken = (user, role) => {
    return jwt.sign(
        { id: user._id, email: user.email, role: role },
        process.env.JWT_SECRET,
        { expiresIn: "3h" } // Durée de validité 1 heure
    );
};

module.exports = { hashPassword, comparePassword, generateToken };
