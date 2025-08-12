const CryptoJS = require("crypto-js");
const SECRET_KEY = process.env.AES_SECRET_KEY;

const encryptMessage = (message) => {
  return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
};

const decryptMessage = (cipherText) => {
  if (!cipherText) return null;
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = { encryptMessage, decryptMessage };
