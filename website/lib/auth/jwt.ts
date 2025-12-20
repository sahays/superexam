import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AccessToken {
  code: string
  isAdmin: boolean
  grantedAt: number
  expiresAt: number
}

export function createToken(payload: AccessToken): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '12h'
  })
}

export function verifyToken(token: string): AccessToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AccessToken

    // Check if expired
    if (decoded.expiresAt < Date.now()) {
      return null
    }

    return decoded
  } catch (error) {
    return null
  }
}

export function isTokenExpired(token: AccessToken): boolean {
  return token.expiresAt < Date.now()
}
