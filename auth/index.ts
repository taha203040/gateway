import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import authRouter from './auth.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT

// ── Middleware ────────────────────────────────────────
app.use(express.json())
// ── Routes ────────────────────────────────────────────
// app.use('/v1',authRouter)
app.use('/v2',authRouter)

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string)
    console.log('[db] connected to mongodb')

    app.listen(PORT, () => {
      console.log(`[server] auth-service running on port ${PORT}`)
    })
  } catch (err) {
    console.error('[db] connection failed', err)
    process.exit(1)
  }
}
app.use((req, res, next) => {
  if (!req.headers['x-gateway-source']) {
    return res.status(403).json({ error: 'Direct access not allowed' })
  }
  next()
})
app.get('/', (req, res) => {
  res.json({ msg: "hello world" })
}
)
start()