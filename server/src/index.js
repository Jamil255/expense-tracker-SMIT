require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const morgan = require('morgan')
const { connectDB } = require('./config/db')
const {
  initializeNotificationScheduler,
} = require('./services/notificationScheduler')
const { verifyEmailConnection } = require('./services/emailService')

const authRoutes = require('./routes/auth')
const expenseRoutes = require('./routes/expenses')
const budgetRoutes = require('./routes/budgets')
const analyticsRoutes = require('./routes/analytics')
const incomeRoutes = require('./routes/income')
const savingsRoutes = require('./routes/savings')
const recurringRoutes = require('./routes/recurring')
const splitsRoutes = require('./routes/splits')
const notificationRoutes = require('./routes/notifications')

const app = express()
const PORT = process.env.PORT || 4000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

// CORS
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
)

// Security and parsers
app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/income', incomeRoutes)
app.use('/api/savings', savingsRoutes)
app.use('/api/recurring', recurringRoutes)
app.use('/api/splits', splitsRoutes)
app.use('/api/notifications', notificationRoutes)

// Start server after DB connects
;(async () => {
  try {
    const uri = process.env.MONGODB_URI
    await connectDB(uri)

    // Verify email connection
    await verifyEmailConnection()

    // Initialize notification scheduler
    initializeNotificationScheduler()

    app.listen(PORT, () =>
      console.log(`Server listening on http://localhost:${PORT}`)
    )
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
})()
