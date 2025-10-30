const cron = require('node-cron')
const NotificationPreference = require('../models/NotificationPreference')
const User = require('../models/User')
const Expense = require('../models/Expense')
const Budget = require('../models/Budget')
const RecurringExpense = require('../models/RecurringExpense')
const {
  sendSpendingAlertEmail,
  sendBillReminderEmail,
  sendSummaryReportEmail,
} = require('./emailService')
const mongoose = require('mongoose')

// Check and send spending alerts
const checkSpendingAlerts = async () => {
  try {
    console.log('🔍 Checking spending alerts...')

    const preferences = await NotificationPreference.find({
      'spendingAlerts.enabled': true,
    }).populate('user')

    for (const pref of preferences) {
      if (!pref.user || !pref.user.email) continue

      // Check if already sent in the last 3 days (reminder system)
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      if (
        pref.lastSpendingAlertSent &&
        pref.lastSpendingAlertSent >= threeDaysAgo
      ) {
        continue
      }

      const userId = new mongoose.Types.ObjectId(pref.user._id)
      const budgets = await Budget.find({ user: userId })
      const now = new Date()

      for (const budget of budgets) {
        let startDate, endDate

        if (budget.period === 'monthly') {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59
          )
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
          startDate = new Date(now.getFullYear(), 0, 1)
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        }

        const expenses = await Expense.aggregate([
          {
            $match: {
              user: userId,
              category: budget.category,
              date: { $gte: startDate, $lte: endDate },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])

        const spent = expenses[0]?.total || 0
        const percentage = (spent / budget.limit) * 100

        if (percentage >= pref.spendingAlerts.threshold) {
          const alert = {
            category: budget.category,
            spent,
            limit: budget.limit,
            percentage: percentage.toFixed(1),
            severity:
              percentage >= 100
                ? 'error'
                : percentage >= 90
                ? 'warning'
                : 'info',
            message:
              percentage >= 100
                ? `You've exceeded your ${budget.category} budget by $${(
                    spent - budget.limit
                  ).toFixed(2)}`
                : `You've spent ${percentage.toFixed(1)}% of your ${
                    budget.category
                  } budget`,
          }

          if (pref.spendingAlerts.email) {
            await sendSpendingAlertEmail(pref.user.email, alert)
          }

          // Update last alert sent time
          pref.lastSpendingAlertSent = new Date()
          await pref.save()
        }
      }
    }

    console.log('✅ Spending alerts check completed')
  } catch (error) {
    console.error('❌ Error checking spending alerts:', error)
  }
}

// Check and send bill reminders
const checkBillReminders = async () => {
  try {
    console.log('🔍 Checking bill reminders...')

    const preferences = await NotificationPreference.find({
      'billReminders.enabled': true,
    }).populate('user')

    for (const pref of preferences) {
      if (!pref.user || !pref.user.email) continue

      const userId = new mongoose.Types.ObjectId(pref.user._id)
      const now = new Date()
      const reminderDate = new Date()
      reminderDate.setDate(
        now.getDate() + pref.billReminders.daysBeforeReminder
      )

      const recurringExpenses = await RecurringExpense.find({
        user: userId,
        isActive: true,
        nextDue: { $lte: reminderDate, $gte: now },
      })

      for (const recurring of recurringExpenses) {
        const daysUntil = Math.ceil(
          (new Date(recurring.nextDue) - now) / (1000 * 60 * 60 * 24)
        )

        const reminder = {
          description: recurring.description,
          amount: recurring.amount,
          category: recurring.category,
          dueDate: recurring.nextDue,
          daysUntil,
          message:
            daysUntil === 0
              ? `${recurring.description} is due today`
              : daysUntil === 1
              ? `${recurring.description} is due tomorrow`
              : `${recurring.description} is due in ${daysUntil} days`,
        }

        if (pref.billReminders.email) {
          await sendBillReminderEmail(pref.user.email, reminder)
        }
      }
    }

    console.log('✅ Bill reminders check completed')
  } catch (error) {
    console.error('❌ Error checking bill reminders:', error)
  }
}

// Send summary reports
const sendSummaryReports = async () => {
  try {
    console.log('🔍 Sending summary reports...')

    const preferences = await NotificationPreference.find({
      'summaryReports.enabled': true,
      'summaryReports.email': true,
    }).populate('user')

    const now = new Date()

    for (const pref of preferences) {
      if (!pref.user || !pref.user.email) continue

      let shouldSend = false
      let period = 'week'
      let startDate

      if (pref.summaryReports.frequency === 'daily') {
        // Check if already sent today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (!pref.lastSummaryReportSent || pref.lastSummaryReportSent < today) {
          shouldSend = true
          period = 'day'
          startDate = today
        }
      } else if (pref.summaryReports.frequency === 'weekly') {
        // Check if it's the right day of week
        if (now.getDay() === pref.summaryReports.dayOfWeek) {
          const weekAgo = new Date(now)
          weekAgo.setDate(now.getDate() - 7)
          if (
            !pref.lastSummaryReportSent ||
            pref.lastSummaryReportSent < weekAgo
          ) {
            shouldSend = true
            period = 'week'
            startDate = weekAgo
          }
        }
      } else if (pref.summaryReports.frequency === 'monthly') {
        // Check if it's the right day of month
        if (now.getDate() === pref.summaryReports.dayOfMonth) {
          const monthAgo = new Date(now)
          monthAgo.setMonth(now.getMonth() - 1)
          if (
            !pref.lastSummaryReportSent ||
            pref.lastSummaryReportSent < monthAgo
          ) {
            shouldSend = true
            period = 'month'
            startDate = monthAgo
          }
        }
      }

      if (shouldSend) {
        const userId = new mongoose.Types.ObjectId(pref.user._id)

        if (!startDate) {
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 7)
        }

        // Get expenses
        const expenses = await Expense.find({
          user: userId,
          date: { $gte: startDate, $lte: now },
        }).sort({ date: -1 })

        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)

        // Get category breakdown
        const categoryBreakdown = await Expense.aggregate([
          {
            $match: {
              user: userId,
              date: { $gte: startDate, $lte: now },
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

        const summaryData = {
          period,
          startDate,
          endDate: now,
          totalSpent,
          totalExpenses: expenses.length,
          categoryBreakdown: categoryBreakdown.map((cat) => ({
            category: cat._id,
            total: cat.total,
            count: cat.count,
            percentage: ((cat.total / totalSpent) * 100).toFixed(1),
          })),
          budgetStatus,
        }

        await sendSummaryReportEmail(pref.user.email, summaryData)

        // Update last report sent time
        pref.lastSummaryReportSent = new Date()
        await pref.save()
      }
    }

    console.log('✅ Summary reports sent')
  } catch (error) {
    console.error('❌ Error sending summary reports:', error)
  }
}

// Initialize notification scheduler
const initializeNotificationScheduler = () => {
  // Check spending alerts every 10 minutes
  cron.schedule('*/10 * * * *', checkSpendingAlerts)

  // Check bill reminders every day at 9 AM
  cron.schedule('0 9 * * *', checkBillReminders)

  // Check for summary reports every day at 8 AM
  cron.schedule('0 8 * * *', sendSummaryReports)
}

module.exports = {
  initializeNotificationScheduler,
  checkSpendingAlerts,
  checkBillReminders,
  sendSummaryReports,
}
