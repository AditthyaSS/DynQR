const CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const SHORT_ID_LENGTH = 8

/**
 * Generates a random 8-character alphanumeric short ID
 * Uses a-z, A-Z, 0-9 (62 characters = ~218 trillion combinations)
 */
export function generateShortId(): string {
    let result = ''
    for (let i = 0; i < SHORT_ID_LENGTH; i++) {
        result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length))
    }
    return result
}
