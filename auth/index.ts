import express     from 'express'
import mongoose    from 'mongoose'
import dotenv      from 'dotenv'
import authRouter  from './auth.routes'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 3000

// ── Middleware ────────────────────────────────────────
app.use(express.json())

// ── Routes ────────────────────────────────────────────
app.use(authRouter)

// ── Global error handler ──────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err.message)
  res.status(500).json({ error: 'internal server error' })
})

// ── Connect to MongoDB then start server ──────────────
console.log(process.env.MONGO_URI)
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

start()
