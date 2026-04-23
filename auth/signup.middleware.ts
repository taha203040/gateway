import { Request, Response, NextFunction } from 'express'
import { User } from './user.model'
import { signAccessToken, signRefreshToken } from './token.service'

// ── POST /api/signup ──────────────────────────────────
// Creates a new user and returns access + refresh tokens
export async function signup(
  req  : Request,
  res  : Response,
  next : NextFunction
): Promise<void> {
  try {
    const { username, email, password } = req.body

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

    // ── Create user (password hashed by pre-save hook) ─
    const user = await User.create({ username, email, password })

    // ── Issue tokens ──────────────────────────────────
    //@ts-ignore
    const payload = { userId: user._id.toString(), email: user.email, role: 'user' }

    res.status(201).json({
      message      : 'account created',
      accessToken  : signAccessToken(payload),
      refreshToken : signRefreshToken(payload),
    })
  } catch (err) {
    next(err)
  }
}
