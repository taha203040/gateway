import express from 'express'
import connectDB from './src/config/db'
import orderRoutes from './src/routes/orders'

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.get('/', (req, res) => {
    res.send('Server is running')
})

// Order routes
app.use('/api/orders', orderRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})

