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
    const { email, password } = req.body

    // ── Validate required fields ──────────────────────
    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' })
      return
    }

    // ── Find user by email ────────────────────────────
    const user = await User.findOne({ email })
    if (!user) {
      // Use a generic message — don't reveal which field is wrong
      res.status(401).json({ error: 'invalid credentials' })
      return
    }

    // ── Verify password ───────────────────────────────
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      res.status(401).json({ error: 'invalid credentials' })
      return
    }

    // ── Issue tokens ──────────────────────────────────
    //@ts-ignore

    const payload = { userId: user._id.toString(), email: user.email, role: 'user' }

    res.status(200).json({
      message: 'login successful',
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    })
  } catch (err) {
    next(err)
  }
}
