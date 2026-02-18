import * as crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function getKey(envKey: string): Buffer {
    const key = Buffer.from(envKey, "hex");
    if (key.length !== KEY_LENGTH) {
        throw new Error(
            `RELAY_ENCRYPTION_KEY must be ${KEY_LENGTH} bytes (64 hex chars)`,
        );
    }
    return key;
}

export function encrypt(plaintext: string, envKey: string): string {
    const key = getKey(envKey);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
        authTagLength: TAG_LENGTH,
    });
    const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decrypt(ciphertext: string, envKey: string): string {
    const key = getKey(envKey);
    const buf = Buffer.from(ciphertext, "base64");
    if (buf.length < IV_LENGTH + TAG_LENGTH) {
        throw new Error("Invalid ciphertext");
    }
    const iv = buf.subarray(0, IV_LENGTH);
    const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = buf.subarray(IV_LENGTH + TAG_LENGTH);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
        authTagLength: TAG_LENGTH,
    });
    decipher.setAuthTag(tag);
    return decipher.update(encrypted) + decipher.final("utf8");
}
