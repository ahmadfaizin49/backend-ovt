const { verifyToken } = require('../helper/jwt');
const prisma = require('../helper/prisma');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token tidak ditemukan' });
        }
        const token = authHeader.split(` `)[1];
        const { valid, expired, decoded } = verifyToken(token);
        if (!valid) {
            return res.status(401).json({ message: expired ? 'Token telah kedaluwarsa' : 'Token tidak valid' });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid' });
    }
}
module.exports = authMiddleware;
