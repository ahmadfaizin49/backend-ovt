const { verifyToken } = require('../helper/jwt');

const refreshTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];
    const { valid, expired, decoded } = verifyToken(token);

    if (valid) {
        req.userId = decoded.id;
        req.tokenExpired = false;
        return next();
    }

    if (expired) {
        req.userId = decoded?.id;
        req.tokenExpired = true;
        return next();
    }

    return res.status(401).json({ message: 'token tidak valid' });
};

module.exports = refreshTokenMiddleware;
