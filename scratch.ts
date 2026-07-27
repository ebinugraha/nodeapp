import crypto from "crypto";

const ENCRYPTION_KEY = "12345678901234567890123456789012"; 
const IV_LENGTH = 16;

function encrypt(text: string) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY).slice(0, 32), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}
console.log(encrypt("test"));
