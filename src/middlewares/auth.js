const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer') ? header.slice(7) : req.cookies?.token;
        if (!token) return res.status(401).json({ message: 'No autenticado' });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id).select('-password');
        if(!user) return res.status(401).json({ message: 'Token invalido' });

        req.user = user;
        next();
    } catch (e) {
        return res.status(401).json({ message: 'Token invalido' });
    }
};