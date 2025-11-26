const bcrypt = require('bcryptjs');

const hashValue = async (plain) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plain, salt);
}
const compareValue = async (plain, hashed) => {
    return bcrypt.compare(plain, hashed);
}

module.exports = {
    hashValue,
    compareValue
}