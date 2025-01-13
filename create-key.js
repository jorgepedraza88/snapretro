import crypto from 'crypto';
// Generate a 256-bit (32-byte) random key
const key = crypto.randomBytes(32); // 32 bytes = 256 bits

// Convert the key to Base64 format
const base64Key = key.toString('base64');

console.log("256-bit Key in Base64:", base64Key);

// Generate a 16-byte random IV
const iv = crypto.randomBytes(16); // 16 bytes = 128 bits
const base64Iv = iv.toString('base64');
console.log("16-byte IV in Base64:", base64Iv);
