const express = require('express')
const { authRequired } = require('../middleware/auth')
const Budget = require('../models/Budget')
const Expense = require('../models/Expense')
const mongoose = require('mongoose')

const router = express.Router()

// Get all budgets for user
router.get('/', authRequired, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id }).sort({
      category: 1,
    })
    res.json(budgets)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create budget
router.post('/', authRequired, async (req, res) => {
  try {
    const { category, limit, period, alertThreshold } = req.body

    // Check if budget already exists
    const existing = await Budget.findOne({
      user: req.user.id,
      category,
      period: period || 'monthly',
    })

    if (existing) {
      return res
        .status(409)
        .json({ message: 'Budget already exists for this category' })
    }

    const budget = await Budget.create({
      user: req.user.id,
      category,
      limit,
      period: period || 'monthly',
      alertThreshold: alertThreshold || 80,
    })

    res.status(201).json(budget)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update budget
router.put('/:id', authRequired, async (req, res) => {
  try {
    const { limit, alertThreshold, period } = req.body
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' })
    }

    if (limit !== undefined) budget.limit = limit
    if (alertThreshold !== undefined) budget.alertThreshold = alertThreshold
    if (period !== undefined) budget.period = period

    await budget.save()
    res.json(budget)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete budget
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' })
    }

    res.json({ message: 'Budget deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete all budgets for the current user
router.delete('/', authRequired, async (req, res) => {
  try {
    const result = await Budget.deleteMany({ user: req.user.id })
    res.json({ ok: true, deletedCount: result.deletedCount })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete budgets' })
  }
})

// Get budget status with spending
router.get('/status', authRequired, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id })
    const now = new Date()
    // Set end date to end of current day to include today's expenses
    const endDate = new Date(now)
    endDate.setHours(23, 59, 59, 999)
    const userId = new mongoose.Types.ObjectId(req.user.id)

    const statusData = await Promise.all(
      budgets.map(async (budget) => {
        let startDate

        // Calculate period start date
        if (budget.period === 'monthly') {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        } else if (budget.period === 'weekly') {
          const day = now.getDay()
          startDate = new Date(now)
          startDate.setDate(now.getDate() - day)
          startDate.setHours(0, 0, 0, 0)
        } else {
          startDate = new Date(now.getFullYear(), 0, 1)
        }
        startDate.setHours(0, 0, 0, 0)

        // Get total spending for this category in current period
        const result = await Expense.aggregate([
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

        const spent = result.length > 0 ? result[0].total : 0
        const percentage = (spent / budget.limit) * 100
        const remaining = budget.limit - spent
        const exceeded = spent > budget.limit ? spent - budget.limit : 0

        return {
          budget: budget.toObject(),
          spent,
          remaining: remaining > 0 ? remaining : 0,
          exceeded,
          percentage: Math.min(percentage, 100),
          isOverBudget: spent > budget.limit,
          isNearLimit: percentage >= budget.alertThreshold,
        }
      })
    )

    res.json(statusData)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
