import { Request, Response, NextFunction } from 'express'
import { User } from './user.model'
import { signAccessToken, signRefreshToken } from './token.service'

// ── POST /api/login ───────────────────────────────────
// Verifies credentials and returns access + refresh tokens
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ISS_MAP = {
      ADMIN: 'https://auth.myapp.com/admin',
      USER_WEB: 'https://auth.myapp.com/user/web',
      USER_MOBILE: 'https://auth.myapp.com/user/mobile',
    }

    // ── Validate required fields ──────────────────────
    const { email, password } = req.body
    const userAgent = req.headers['user-agent'] || ''

    // ── Check if user exists ──────────────────────────
    const user = await User.findOne({ email })
    if (!user) {
      res.status(401).json({ error: 'invalid credentials' })
      return
    }

    // ── Verify password ───────────────────────────────
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      res.status(401).json({ error: 'invalid credentials' })
      return
    }

    // ── Determine platform from User-Agent ────────────
    const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)

    // ── Determine iss key based on role and platform ──
    let issKey: keyof typeof ISS_MAP
    if (user.role === 'ADMIN') {
      issKey = 'ADMIN'
    } else {
      issKey = isMobile ? 'USER_MOBILE' : 'USER_WEB'
    }

    // ── Create JWT payload ────────────────────────────
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      iss: ISS_MAP[issKey],
      tier: user.tier,
      jti: crypto.randomUUID(), // Required for blacklist
      iat: Math.floor(Date.now() / 1000),
    }

    // ── Issue tokens ──────────────────────────────────
    res.status(200).json({
      message: 'login successful',
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    })
  } catch (err) {
    next(err)
  }
}