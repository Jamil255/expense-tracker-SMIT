const express = require('express')
const { authRequired } = require('../middleware/auth')
const NotificationPreference = require('../models/NotificationPreference')
const Expense = require('../models/Expense')
const Budget = require('../models/Budget')
const RecurringExpense = require('../models/RecurringExpense')
const User = require('../models/User')
const {
  sendSpendingAlertEmail,
  sendBillReminderEmail,
  sendSummaryReportEmail,
} = require('../services/emailService')
const mongoose = require('mongoose')

const router = express.Router()

// Get user's notification preferences
router.get('/preferences', authRequired, async (req, res) => {
  try {
    let preferences = await NotificationPreference.findOne({
      user: req.user.id,
    })

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await NotificationPreference.create({
        user: req.user.id,
      })
    }

    res.json(preferences)
  } catch (error) {
    console.error('Get preferences error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update notification preferences
router.put('/preferences', authRequired, async (req, res) => {
  try {
    const { spendingAlerts, billReminders, summaryReports } = req.body

    let preferences = await NotificationPreference.findOne({
      user: req.user.id,
    })

    if (!preferences) {
      preferences = await NotificationPreference.create({
        user: req.user.id,
        spendingAlerts,
        billReminders,
        summaryReports,
      })
    } else {
      if (spendingAlerts) preferences.spendingAlerts = spendingAlerts
      if (billReminders) preferences.billReminders = billReminders
      if (summaryReports) preferences.summaryReports = summaryReports
      await preferences.save()
    }

    res.json(preferences)
  } catch (error) {
    console.error('Update preferences error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get spending alerts (check if over budget)
router.get('/spending-alerts', authRequired, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)
    let preferences = await NotificationPreference.findOne({
      user: userId,
    })

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await NotificationPreference.create({
        user: req.user.id,
      })
    }

    if (!preferences.spendingAlerts.enabled) {
      return res.json({ alerts: [] })
    }

    // Get all budgets
    const budgets = await Budget.find({ user: userId })

    const alerts = []
    const now = new Date()

    for (const budget of budgets) {
      // Calculate current period expenses
      let startDate, endDate

      if (budget.period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      } else if (budget.period === 'weekly') {
        const dayOfWeek = now.getDay()
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        startDate = new Date(now)
        startDate.setDate(diff)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
      } else {
        // yearly
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
      }

      // Get expenses for this category in the period
      const expenses = await Expense.aggregate([
        {
          $match: {
            user: userId,
            category: budget.category,
            date: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ])

      const spent = expenses[0]?.total || 0
      const percentage = (spent / budget.limit) * 100

      if (percentage >= preferences.spendingAlerts.threshold) {
        alerts.push({
          type: 'spending',
          category: budget.category,
          spent,
          limit: budget.limit,
          percentage: percentage.toFixed(1),
          severity:
            percentage >= 100 ? 'error' : percentage >= 90 ? 'warning' : 'info',
          message:
            percentage >= 100
              ? `You've exceeded your ${budget.category} budget by $${(
                  spent - budget.limit
                ).toFixed(2)}`
              : `You've spent ${percentage.toFixed(1)}% of your ${
                  budget.category
                } budget`,
        })
      }
    }

    res.json({ alerts })
  } catch (error) {
    console.error('Get spending alerts error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get bill reminders (upcoming recurring expenses)
router.get('/bill-reminders', authRequired, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)
    let preferences = await NotificationPreference.findOne({
      user: userId,
    })

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await NotificationPreference.create({
        user: req.user.id,
      })
    }

    if (!preferences.billReminders.enabled) {
      return res.json({ reminders: [] })
    }

    const now = new Date()
    const reminderDate = new Date()
    reminderDate.setDate(
      now.getDate() + preferences.billReminders.daysBeforeReminder
    )

    console.log('=== BILL REMINDERS DEBUG ===')
    console.log('Now:', now)
    console.log('Reminder Date:', reminderDate)
    console.log(
      'Days Before Reminder:',
      preferences.billReminders.daysBeforeReminder
    )
    console.log('Bill Reminders Enabled:', preferences.billReminders.enabled)

    // Get active recurring expenses
    const recurringExpenses = await RecurringExpense.find({
      user: userId,
      isActive: true,
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }],
    })

    console.log('Found Recurring Expenses:', recurringExpenses.length)

    const reminders = []

    for (const recurring of recurringExpenses) {
      console.log(
        'Checking recurring:',
        recurring.description,
        'Next:',
        recurring.nextOccurrence
      )
      const nextDate = getNextOccurrence(recurring.nextOccurrence, now)
      console.log('Calculated nextDate:', nextDate)
      console.log(
        'Is nextDate <= reminderDate?',
        nextDate ? nextDate <= reminderDate : 'null'
      )

      if (nextDate && nextDate <= reminderDate) {
        const daysUntil = Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24))

        reminders.push({
          type: 'bill',
          description: recurring.description,
          amount: recurring.amount,
          category: recurring.category,
          dueDate: nextDate,
          daysUntil,
          message:
            daysUntil === 0
              ? `${recurring.description} is due today`
              : daysUntil === 1
              ? `${recurring.description} is due tomorrow`
              : `${recurring.description} is due in ${daysUntil} days`,
        })
      }
    }

    console.log('Total reminders generated:', reminders.length)
    console.log('=== END DEBUG ===')

    res.json({ reminders })
  } catch (error) {
    console.error('Get bill reminders error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get summary report data
router.get('/summary-report', authRequired, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const { period = 'week' } = req.query

    const now = new Date()
    // Set end date to end of current day to include today's expenses
    const endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)
    let startDate

    if (period === 'week') {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      startDate.setHours(0, 0, 0, 0)
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      startDate.setHours(0, 0, 0, 0)
    } else {
      // day
      startDate = new Date(now)
      startDate.setHours(0, 0, 0, 0)
    }

    // Get expenses
    const expenses = await Expense.find({
      user: userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 })

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    // Get category breakdown
    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ])

    // Get budget status
    const budgets = await Budget.find({ user: userId })
    const budgetStatus = []

    for (const budget of budgets) {
      const categoryTotal = categoryBreakdown.find(
        (cat) => cat._id === budget.category
      )
      const spent = categoryTotal?.total || 0
      const percentage = (spent / budget.limit) * 100

      budgetStatus.push({
        category: budget.category,
        spent,
        limit: budget.limit,
        percentage: percentage.toFixed(1),
        remaining: budget.limit - spent,
      })
    }

    // Get top expenses
    const topExpenses = expenses.slice(0, 5)

    res.json({
      period,
      startDate,
      endDate: now,
      totalSpent,
      totalExpenses: expenses.length,
      categoryBreakdown: categoryBreakdown.map((cat) => ({
        category: cat._id,
        total: cat.total,
        count: cat.count,
        percentage:
          totalSpent > 0 ? ((cat.total / totalSpent) * 100).toFixed(1) : '0',
      })),
      budgetStatus,
      topExpenses,
    })
  } catch (error) {
    console.error('Get summary report error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Helper function to get next occurrence date
function getNextOccurrence(currentDate, referenceDate) {
  if (!currentDate) return null

  const next = new Date(currentDate)

  // If the date is already in the future, return it
  if (next >= referenceDate) {
    return next
  }

  // If the date is in the past, it's already overdue
  // Return it so we can send reminders for overdue bills
  return next
}

// TESTING ONLY - Reset notification throttle for testing
router.delete('/reset-throttle', authRequired, async (req, res) => {
  try {
    const result = await NotificationPreference.findOneAndUpdate(
      { user: req.user.id },
      { $unset: { lastSpendingAlertSent: '' } },
      { new: true }
    )

    if (!result) {
      return res.status(404).json({ message: 'Preferences not found' })
    }

    res.json({
      message:
        'Throttle reset successfully! You can now receive alerts immediately.',
      lastSpendingAlertSent: null,
    })
  } catch (error) {
    console.error('Reset throttle error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
