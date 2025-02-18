/**
 * Generate a symmetric AES-GCM key of 256 bits
 */
export async function generateSymmetricKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Export the symmetric key to a Base64 string so it can be shared
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const rawKey = await window.crypto.subtle.exportKey('raw', key);
  // Convert the ArrayBuffer to a Base64 string
  const keyArray = new Uint8Array(rawKey);
  let binary = '';
  keyArray.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

/**
 * Import a symmetric key from a Base64 string
 */
export async function importKey(keyString?: string): Promise<CryptoKey> {
  if (!keyString) {
    throw new Error('No key provided');
  }
  // Convert from Base64 to an ArrayBuffer
  const binary = atob(keyString);
  const keyArray = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    keyArray[i] = binary.charCodeAt(i);
  }
  return await window.crypto.subtle.importKey('raw', keyArray, { name: 'AES-GCM' }, true, [
    'encrypt',
    'decrypt'
  ]);
}

/**
 * Descifra un mensaje cifrado en formato Base64 usando la clave proporcionada.
 * Se asume que el mensaje cifrado contiene, en los primeros 12 bytes, el IV utilizado.
 *
 * @param encryptedMessage - El mensaje cifrado en formato Base64.
 * @param key - La clave CryptoKey que se usó para cifrar (y que se usará para descifrar).
 * @returns El mensaje original en texto plano.
 */
export async function decryptMessage(encryptedMessage: string, key: CryptoKey): Promise<string> {
  // Convertir el mensaje cifrado de Base64 a un Uint8Array
  const combined = Uint8Array.from(atob(encryptedMessage), (char) => char.charCodeAt(0));

  // Extraer el IV (vector de inicialización) que se encuentra en los primeros 12 bytes
  const iv = combined.slice(0, 12);

  // El resto del array corresponde a los datos cifrados
  const data = combined.slice(12);

  // Usamos la API Web Crypto para descifrar
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    data
  );

  // Convertir el resultado (ArrayBuffer) a texto usando TextDecoder
  return new TextDecoder().decode(decryptedBuffer);
}

/**
 * Cifra un mensaje de texto utilizando la clave proporcionada y devuelve el resultado en Base64.
 * Se genera un vector de inicialización (IV) aleatorio de 12 bytes, que se concatena con el mensaje cifrado.
 *
 * @param message - El mensaje en texto plano que se desea cifrar.
 * @param key - La clave CryptoKey que se utilizará para cifrar.
 * @returns El mensaje cifrado en formato Base64.
 */
export async function encryptMessage(message: string, key?: CryptoKey): Promise<string> {
  if (!key) {
    throw new Error('No key provided');
  }
  // Codificar el mensaje a un Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  // Generar un IV (vector de inicialización) aleatorio de 12 bytes
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Encriptar el mensaje usando AES-GCM
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    data
  );

  // Convertir el ArrayBuffer del mensaje cifrado a un Uint8Array
  const encryptedArray = new Uint8Array(encryptedBuffer);

  // Concatenar el IV y el contenido cifrado para poder usar el IV en el descifrado
  const combined = new Uint8Array(iv.byteLength + encryptedArray.byteLength);
  combined.set(iv);
  combined.set(encryptedArray, iv.byteLength);

  // Convertir el array combinado a una cadena en Base64 para facilitar el almacenamiento y envío
  let binary = '';
  for (let i = 0; i < combined.byteLength; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}
