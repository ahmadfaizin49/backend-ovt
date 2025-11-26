const crypto = require('crypto');

const generateOtpCode = () => {
    return crypto.randomInt(100000, 999999).toString();
}
module.exports = {
    generateOtpCode
}