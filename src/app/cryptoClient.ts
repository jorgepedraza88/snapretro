import nacl from 'tweetnacl';
import { decodeBase64, decodeUTF8, encodeBase64, encodeUTF8 } from 'tweetnacl-util';

/**
 * Generates a random symmetric key (32 bytes) and returns it in Base64 format.
 */
export function generateSymmetricKey(): string {
  return encodeBase64(nacl.randomBytes(32));
}

/**
 * Encrypts a message using a Base64 key with NaCl (XChaCha20-Poly1305).
 */
export function encryptMessage(message: string, keyBase64: string): string {
  if (!message) throw new Error('Message cannot be empty');
  if (!keyBase64) throw new Error('Encryption key is missing');

  const key = decodeBase64(keyBase64);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const messageUint8 = decodeUTF8(message);
  const encrypted = nacl.secretbox(messageUint8, nonce, key);

  // 🔹 Concatenate nonce + encrypted message
  const combined = new Uint8Array([...nonce, ...encrypted]);
  const encryptedBase64 = encodeBase64(combined);

  return encryptedBase64;
}

/**
 * Decrypts a Base64-encrypted message using a Base64 key.
 */
export function decryptMessage(encryptedMessageBase64: string, keyBase64: string): string {
  if (!encryptedMessageBase64) throw new Error('Encrypted message is missing');
  if (!keyBase64) throw new Error('Decryption key is missing');

  const key = decodeBase64(keyBase64);
  const encryptedMessageWithNonce = decodeBase64(encryptedMessageBase64);

  // Verify that the encrypted message has the correct length
  if (encryptedMessageWithNonce.length < nacl.secretbox.nonceLength) {
    throw new Error('Encrypted message is too short');
  }

  // 🔹 Extract the nonce and the encrypted message
  const nonce = encryptedMessageWithNonce.slice(0, nacl.secretbox.nonceLength);
  const encryptedMessage = encryptedMessageWithNonce.slice(nacl.secretbox.nonceLength);

  // 🔹 Attempt to decrypt
  const decrypted = nacl.secretbox.open(encryptedMessage, nonce, key);
  if (!decrypted) {
    throw new Error('Failed to decrypt message - Possible nonce or key mismatch');
  }

  return encodeUTF8(decrypted);
}
