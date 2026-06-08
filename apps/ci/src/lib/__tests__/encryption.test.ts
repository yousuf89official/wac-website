// Set encryption key before importing the module
process.env.ENCRYPTION_KEY = 'test-key-that-is-at-least-32-chars-long-for-aes256';

import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, isEncrypted } from '../encryption';

describe('encrypt', () => {
    it('returns a base64 string different from input', () => {
        const plaintext = 'my-secret-api-key';
        const encrypted = encrypt(plaintext);
        expect(encrypted).not.toBe(plaintext);
        // Verify it's valid base64
        expect(() => Buffer.from(encrypted, 'base64')).not.toThrow();
    });

    it('handles empty string', () => {
        const encrypted = encrypt('');
        expect(encrypted).toBeTruthy();
        expect(decrypt(encrypted)).toBe('');
    });

    it('handles long strings (1000+ chars)', () => {
        const longString = 'a'.repeat(1500);
        const encrypted = encrypt(longString);
        expect(decrypt(encrypted)).toBe(longString);
    });

    it('produces different ciphertexts for the same plaintext (random salt)', () => {
        const plaintext = 'same-input-text';
        const encrypted1 = encrypt(plaintext);
        const encrypted2 = encrypt(plaintext);
        expect(encrypted1).not.toBe(encrypted2);
    });
});

describe('decrypt', () => {
    it('roundtrips: decrypt(encrypt(text)) returns original text', () => {
        const plaintext = 'google-ads-refresh-token-abc123';
        const encrypted = encrypt(plaintext);
        expect(decrypt(encrypted)).toBe(plaintext);
    });

    it('roundtrips with special characters', () => {
        const plaintext = '{"key": "value", "emoji": "🔑"}';
        const encrypted = encrypt(plaintext);
        expect(decrypt(encrypted)).toBe(plaintext);
    });
});

describe('isEncrypted', () => {
    it('returns true for encrypted strings', () => {
        const encrypted = encrypt('some-secret');
        expect(isEncrypted(encrypted)).toBe(true);
    });

    it('returns false for plain strings', () => {
        expect(isEncrypted('hello-world')).toBe(false);
    });

    it('returns false for empty string', () => {
        expect(isEncrypted('')).toBe(false);
    });

    it('returns false for short base64 strings', () => {
        // Base64 that decodes to less than salt+iv+tag+1 bytes
        expect(isEncrypted(Buffer.from('short').toString('base64'))).toBe(false);
    });

    it('returns false for non-base64 strings', () => {
        expect(isEncrypted('not-valid-base64!@#$%^&*()')).toBe(false);
    });
});
