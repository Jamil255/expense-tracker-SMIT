const express = require('express')
const { authRequired } = require('../middleware/auth')
const Expense = require('../models/Expense')
const mongoose = require('mongoose')

const router = express.Router()

// Get spending trends (compare periods)
router.get('/trends', authRequired, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const now = new Date()

    // Current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    )

    // Last month
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59
    )

    // Last 6 months trend
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    const [currentMonth, lastMonth, monthlyTrend] = await Promise.all([
      // Current month total
      Expense.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: currentMonthStart, $lte: currentMonthEnd },
          },
        },
        {
          $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } },
        },
      ]),

      // Last month total
      Expense.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: lastMonthStart, $lte: lastMonthEnd },
          },
        },
        {
          $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } },
        },
      ]),

      // Monthly trend for last 6 months
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ])

    const currentTotal = currentMonth[0]?.total || 0
    const lastTotal = lastMonth[0]?.total || 0
    const percentageChange =
      lastTotal === 0 ? 0 : ((currentTotal - lastTotal) / lastTotal) * 100

    res.json({
      currentMonth: {
        total: currentTotal,
        count: currentMonth[0]?.count || 0,
      },
      lastMonth: {
        total: lastTotal,
        count: lastMonth[0]?.count || 0,
      },
      percentageChange: parseFloat(percentageChange.toFixed(2)),
      monthlyTrend: monthlyTrend.map((m) => ({
        month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
        total: m.total,
        count: m.count,
      })),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get category analysis
router.get('/category-analysis', authRequired, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const { from, to } = req.query

    const match = { user: userId }
    if (from || to) {
      match.date = {}
      if (from) match.date.$gte = new Date(from)
      if (to) match.date.$lte = new Date(to)
    }

    const categoryAnalysis = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
          minAmount: { $min: '$amount' },
          maxAmount: { $max: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ])

    const totalSpending = categoryAnalysis.reduce(
      (acc, cat) => acc + cat.total,
      0
    )

    const result = categoryAnalysis.map((cat) => ({
      category: cat._id,
      total: cat.total,
      count: cat.count,
      avgAmount: parseFloat(cat.avgAmount.toFixed(2)),
      minAmount: cat.minAmount,
      maxAmount: cat.maxAmount,
      percentage: parseFloat(((cat.total / totalSpending) * 100).toFixed(2)),
    }))

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get spending predictions
router.get('/predictions', authRequired, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const now = new Date()

    // Get last 3 months of data
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)

    const monthlyData = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: threeMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    if (monthlyData.length < 2) {
      return res.json({
        prediction: 0,
        confidence: 'low',
        message: 'Need more data for accurate predictions',
      })
    }

    // Simple moving average prediction
    const totals = monthlyData.map((m) => m.total)
    const average = totals.reduce((a, b) => a + b, 0) / totals.length

    // Calculate trend
    const firstHalf = totals.slice(0, Math.ceil(totals.length / 2))
    const secondHalf = totals.slice(Math.ceil(totals.length / 2))
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    const trend = secondAvg - firstAvg

    const prediction = average + trend
    const confidence = monthlyData.length >= 3 ? 'high' : 'medium'

    res.json({
      prediction: parseFloat(prediction.toFixed(2)),
      average: parseFloat(average.toFixed(2)),
      trend: parseFloat(trend.toFixed(2)),
      confidence,
      dataPoints: monthlyData.length,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get top expenses
router.get('/top-expenses', authRequired, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const { limit = 10, from, to } = req.query

    const match = { user: userId }
    if (from || to) {
      match.date = {}
      if (from) match.date.$gte = new Date(from)
      if (to) match.date.$lte = new Date(to)
    }

    const topExpenses = await Expense.find(match)
      .sort({ amount: -1 })
      .limit(parseInt(limit))
      .select('amount category description date')

    res.json(topExpenses)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get spending by day of week
router.get('/day-of-week', authRequired, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)

    const dayAnalysis = await Expense.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]

    const result = dayAnalysis.map((day) => ({
      day: dayNames[day._id - 1],
      dayNumber: day._id,
      total: day.total,
      count: day.count,
      avgAmount: parseFloat(day.avgAmount.toFixed(2)),
    }))

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
