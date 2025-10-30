const NotificationPreference = require('../models/NotificationPreference')
const Budget = require('../models/Budget')
const Expense = require('../models/Expense')
const { sendSpendingAlertEmail } = require('../services/emailService')
const mongoose = require('mongoose')

const checkRealTimeSpendingAlert = async (userId, expense) => {
  try {
    console.log(
      `🔍 Checking real-time alert for user ${userId}, category: ${expense.category}, amount: ${expense.amount}`
    )

    // Get user's notification preferences
    const preference = await NotificationPreference.findOne({
      user: userId,
    }).populate('user')

    // Check if spending alerts are enabled
    if (
      !preference ||
      !preference.spendingAlerts?.enabled ||
      !preference.spendingAlerts?.email
    ) {
      console.log('⚠️ Spending alerts not enabled or preference not found')
      return
    }

    console.log(
      `✅ Preferences found, threshold: ${preference.spendingAlerts.threshold}%`
    )

    // Don't send multiple alerts within 3 days (72 hours) - reminder system
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    if (
      preference.lastSpendingAlertSent &&
      preference.lastSpendingAlertSent > threeDaysAgo
    ) {
      console.log('⏰ Alert already sent within last 3 days, skipping')
      return
    }

    // Find the budget for this expense's category
    const budget = await Budget.findOne({
      user: userId,
      category: expense.category,
    })

    if (!budget) {
      console.log(`⚠️ No budget found for category: ${expense.category}`)
      return // No budget set for this category
    }

    console.log(
      `💰 Budget found: ${budget.category} - $${budget.limit} (${budget.period})`
    )

    // Calculate the date range based on budget period
    const now = new Date()
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
      startDate = new Date(now.getFullYear(), 0, 1)
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
    }

    console.log(
      `📅 Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`
    )

    // Calculate total spent in this budget period
    const expenses = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          category: budget.category,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])

    const spent = expenses[0]?.total || 0
    const percentage = (spent / budget.limit) * 100

    console.log(
      `📊 Total spent: $${spent} / $${budget.limit} = ${percentage.toFixed(1)}%`
    )

    // Check if threshold is crossed
    if (percentage >= preference.spendingAlerts.threshold) {
      const alert = {
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
      }

      console.log(`📧 Sending real-time alert to ${preference.user.email}...`)

      // Send email alert
      await sendSpendingAlertEmail(preference.user.email, alert)

      console.log(
        `✅ Real-time alert sent to ${preference.user.email} for ${
          budget.category
        } (${percentage.toFixed(1)}%)`
      )

      // Update last alert sent time
      preference.lastSpendingAlertSent = new Date()
      await preference.save()
    } else {
      console.log(
        `ℹ️ Percentage ${percentage.toFixed(1)}% below threshold ${
          preference.spendingAlerts.threshold
        }%`
      )
    }
  } catch (error) {
    console.error('❌ Error checking real-time spending alert:', error)
    // Don't throw error - we don't want to fail the expense creation
  }
}

module.exports = { checkRealTimeSpendingAlert }
