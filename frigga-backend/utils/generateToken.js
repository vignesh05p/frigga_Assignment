const crypto = require('crypto');

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = { generateResetToken };
