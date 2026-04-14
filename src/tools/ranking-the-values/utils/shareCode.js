// Generates an 8-character alphanumeric share code (URL-safe, no ambiguous chars)
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'

export function generateShareCode() {
  const array = crypto.getRandomValues(new Uint8Array(8))
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += CHARS[array[i] % CHARS.length]
  }
  return code
}
