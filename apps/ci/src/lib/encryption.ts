import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

function getEncryptionKey(): string {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error("ENCRYPTION_KEY environment variable is not set");
    }
    return key;
}

function deriveKey(salt: Buffer): Buffer {
    return scryptSync(getEncryptionKey(), salt, KEY_LENGTH);
}

/**
 * Encrypt a plaintext string. Returns a base64-encoded string containing salt + iv + tag + ciphertext.
 */
export function encrypt(plaintext: string): string {
    const salt = randomBytes(SALT_LENGTH);
    const key = deriveKey(salt);
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const tag = cipher.getAuthTag();

    // Format: salt(16) + iv(16) + tag(16) + ciphertext
    const result = Buffer.concat([salt, iv, tag, encrypted]);
    return result.toString("base64");
}

/**
 * Decrypt a base64-encoded encrypted string.
 */
export function decrypt(encryptedBase64: string): string {
    const data = Buffer.from(encryptedBase64, "base64");

    const salt = data.subarray(0, SALT_LENGTH);
    const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const ciphertext = data.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = deriveKey(salt);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
}

/**
 * Check if a string appears to be encrypted (base64 with minimum length for salt+iv+tag).
 */
export function isEncrypted(value: string): boolean {
    if (!value || value.length < 64) return false;
    try {
        const buf = Buffer.from(value, "base64");
        return buf.length >= SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1;
    } catch {
        return false;
    }
}
