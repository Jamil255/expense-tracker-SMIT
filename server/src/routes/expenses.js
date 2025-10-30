const express = require('express')
const { body, validationResult, query } = require('express-validator')
const { authRequired } = require('../middleware/auth')
const Expense = require('../models/Expense')
const { checkRealTimeSpendingAlert } = require('../utils/checkRealTimeAlert')

const router = express.Router()

router.use(authRequired)

const expenseValidators = [
  body('amount').isFloat({ min: 0 }),
  body('category').isString().trim().notEmpty(),
  body('date').isISO8601().toDate(),
  body('note').optional().isString(),
]

router.get(
  '/',
  [
    query('from').optional().isISO8601().toDate(),
    query('to').optional().isISO8601().toDate(),
    query('category').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() })
    const { from, to, category } = req.query
    const filter = { user: req.user.id }
    if (from || to) {
      filter.date = {}
      if (from) filter.date.$gte = from
      if (to) filter.date.$lte = to
    }
    if (category) filter.category = category
    const items = await Expense.find(filter).sort({ date: -1, createdAt: -1 })
    res.json({ items })
  }
)

router.post('/', expenseValidators, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  const { amount, category, date, note } = req.body
  const created = await Expense.create({
    user: req.user.id,
    amount,
    category,
    date,
    note,
  })

  // Check if this expense triggers a spending alert (real-time)
  // Don't await - let it run in background so response is fast
  checkRealTimeSpendingAlert(req.user.id, created).catch((err) => {
    console.error('Real-time alert error:', err)
  })

  res.status(201).json({ item: created })
})

router.put('/:id', expenseValidators, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  const { id } = req.params
  const { amount, category, date, note } = req.body
  const updated = await Expense.findOneAndUpdate(
    { _id: id, user: req.user.id },
    { amount, category, date, note },
    { new: true }
  )
  if (!updated) return res.status(404).json({ message: 'Not found' })

  // Check if this updated expense triggers a spending alert (real-time)
  // Don't await - let it run in background so response is fast
  checkRealTimeSpendingAlert(req.user.id, updated).catch((err) => {
    console.error('Real-time alert error:', err)
  })

  res.json({ item: updated })
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params
  const deleted = await Expense.findOneAndDelete({ _id: id, user: req.user.id })
  if (!deleted) return res.status(404).json({ message: 'Not found' })
  res.json({ ok: true })
})

// Delete all expenses for the current user
router.delete('/', async (req, res) => {
  try {
    const result = await Expense.deleteMany({ user: req.user.id })
    res.json({ ok: true, deletedCount: result.deletedCount })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete expenses' })
  }
})

router.get('/summary', async (req, res) => {
  const { from, to } = req.query
  const mongoose = require('mongoose')
  const match = { user: new mongoose.Types.ObjectId(req.user.id) }
  if (from || to) {
    match.date = {}
    if (from) match.date.$gte = new Date(from)
    if (to) match.date.$lte = new Date(to)
  }
  const [byCategory, byMonth] = await Promise.all([
    Expense.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ])

  res.json({ byCategory, byMonth })
})

module.exports = router
