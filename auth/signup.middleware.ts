import { Request, Response, NextFunction } from 'express'
import { User } from './user.model'
import { signAccessToken, signRefreshToken } from './token.service'
import crypto from 'crypto'

// ── POST /api/signup ──────────────────────────────────
// Creates a new user and returns access + refresh tokens
export async function signup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, email, password } = req.body
    const userAgent = req.headers['user-agent'] || ''

    // ── Validate required fields ──────────────────────
    if (!username || !email || !password) {
      res.status(400).json({ error: 'username, email and password are required' })
      return
    }

    // ── Check for duplicate email or username ─────────
    const existing = await User.findOne({ $or: [{ email }, { username }] })
    if (existing) {
      const field = existing.email === email ? 'email' : 'username'
      res.status(409).json({ error: `${field} is already taken` })
      return
    }

    // ── Determine platform from User-Agent ────────────
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)

    // ── Default role for new users ────────────────────
    const role = 'USER'  // Default role, not 'user'

    // ── Determine iss based on role and platform ──────
    const ISS_MAP = {
      ADMIN: 'https://auth.myapp.com/admin',
      USER_WEB: 'https://auth.myapp.com/user/web',
      USER_MOBILE: 'https://auth.myapp.com/user/mobile',
    }

    let iss: string
    if (role as string === 'ADMIN') {
      iss = ISS_MAP.ADMIN
    } else {
      iss = isMobile ? ISS_MAP.USER_MOBILE : ISS_MAP.USER_WEB
    }

    // ── Create user (password hashed by pre-save hook) ─
    const user = await User.create({
      username,
      email,
      password,
      role: role,
      tier: 'FREE'
    })

    // ── Create JWT payload (matching login structure) ─
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      iss: iss,
      tier: user.tier,
      jti: crypto.randomUUID(),
      iat: Math.floor(Date.now() / 1000),
    }

    // ── Issue tokens ──────────────────────────────────
    res.status(201).json({
      message: 'account created',
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    })
  } catch (err) {
    next(err)
  }
}