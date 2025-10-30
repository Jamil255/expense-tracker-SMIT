const express = require('express')
const { authRequired } = require('../middleware/auth')
const RecurringExpense = require('../models/RecurringExpense')
const Expense = require('../models/Expense')

const router = express.Router()

// Calculate next occurrence date
function calculateNextOccurrence(startDate, frequency, currentDate = null) {
  const date = currentDate ? new Date(currentDate) : new Date(startDate)

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      break
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'bi-weekly':
      date.setDate(date.getDate() + 14)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'quarterly':
      date.setMonth(date.getMonth() + 3)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
  }

  return date
}

// Get all recurring expenses
router.get('/', authRequired, async (req, res) => {
  try {
    const { isActive } = req.query
    const filter = { user: req.user.id }

    if (isActive !== undefined) filter.isActive = isActive === 'true'

    const recurring = await RecurringExpense.find(filter).sort({
      nextOccurrence: 1,
    })
    res.json(recurring)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create recurring expense
router.post('/', authRequired, async (req, res) => {
  try {
    const { amount, category, description, frequency, startDate, endDate } =
      req.body

    const start = new Date(startDate)
    const nextOccurrence = calculateNextOccurrence(start, frequency)

    const recurring = await RecurringExpense.create({
      user: req.user.id,
      amount,
      category,
      description,
      frequency,
      startDate: start,
      endDate: endDate ? new Date(endDate) : null,
      nextOccurrence,
    })

    res.status(201).json(recurring)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update recurring expense
router.put('/:id', authRequired, async (req, res) => {
  try {
    const {
      amount,
      category,
      description,
      frequency,
      startDate,
      endDate,
      isActive,
    } = req.body

    const recurring = await RecurringExpense.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring expense not found' })
    }

    if (amount !== undefined) recurring.amount = amount
    if (category !== undefined) recurring.category = category
    if (description !== undefined) recurring.description = description
    if (frequency !== undefined) {
      recurring.frequency = frequency
      recurring.nextOccurrence = calculateNextOccurrence(
        recurring.startDate,
        frequency
      )
    }
    if (startDate !== undefined) recurring.startDate = new Date(startDate)
    if (endDate !== undefined)
      recurring.endDate = endDate ? new Date(endDate) : null
    if (isActive !== undefined) recurring.isActive = isActive

    await recurring.save()
    res.json(recurring)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Process due recurring expenses (create actual expenses)
router.post('/process', authRequired, async (req, res) => {
  try {
    const now = new Date()
    const dueRecurring = await RecurringExpense.find({
      user: req.user.id,
      isActive: true,
      nextOccurrence: { $lte: now },
    })

    const createdExpenses = []

    for (const recurring of dueRecurring) {
      // Create the actual expense
      const expense = await Expense.create({
        user: recurring.user,
        amount: recurring.amount,
        category: recurring.category,
        description: `${recurring.description} (Recurring)`,
        date: recurring.nextOccurrence,
      })

      createdExpenses.push(expense)

      // Update next occurrence
      recurring.lastProcessed = recurring.nextOccurrence
      recurring.nextOccurrence = calculateNextOccurrence(
        recurring.startDate,
        recurring.frequency,
        recurring.nextOccurrence
      )

      // Check if past end date
      if (recurring.endDate && recurring.nextOccurrence > recurring.endDate) {
        recurring.isActive = false
      }

      await recurring.save()
    }

    res.json({
      message: `Processed ${createdExpenses.length} recurring expenses`,
      expenses: createdExpenses,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete recurring expense
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const recurring = await RecurringExpense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!recurring) {
      return res.status(404).json({ message: 'Recurring expense not found' })
    }

    res.json({ message: 'Recurring expense deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete all recurring expenses for the current user
router.delete('/', authRequired, async (req, res) => {
  try {
    const result = await RecurringExpense.deleteMany({ user: req.user.id })
    res.json({ ok: true, deletedCount: result.deletedCount })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete recurring expenses' })
  }
})

module.exports = router
