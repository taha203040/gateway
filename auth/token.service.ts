import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

// ── Load private key once at startup ─────────────────
// Never expose this key outside auth-service
const PRIVATE_KEY = fs.readFileSync(
  path.resolve(__dirname, './keys/private.pem'),
  'utf8'
)

const ACCESS_TOKEN_EXPIRY  = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

export interface TokenPayload {
  userId : string
  email  : string
  role   : string
}

// ── Sign an access token (short-lived) ───────────────
export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, PRIVATE_KEY, {
    algorithm : 'RS256',
    expiresIn : ACCESS_TOKEN_EXPIRY,
  })
}

// ── Sign a refresh token (long-lived) ────────────────
export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, PRIVATE_KEY, {
    algorithm : 'RS256',
    expiresIn : REFRESH_TOKEN_EXPIRY,
  })
}
