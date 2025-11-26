const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = '1h';
    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
}
const generateRefreshToken = (payload) => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const expiresIn = '7d';
    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
}
const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        return {
            valid: true,
            expired: false,
            decoded
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return {
                valid: false,
                expired: true,
                decoded: null
            }
        }
        return {
            valid: false,
            expired: false,
            decoded: null
        }
    }
}
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return {
            valid: true,
            expired: false,
            decoded
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return {
                valid: false,
                expired: true,
                decoded: null
            }
        }
        return {
            valid: false,
            expired: false,
            decoded: null
        }
    }
}
module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken
}