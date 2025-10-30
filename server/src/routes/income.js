const express = require('express')
const { authRequired } = require('../middleware/auth')
const Income = require('../models/Income')
const mongoose = require('mongoose')

const router = express.Router()

// Get all income
router.get('/', authRequired, async (req, res) => {
  try {
    const { from, to, source } = req.query
    const filter = { user: req.user.id }

    if (from || to) {
      filter.date = {}
      if (from) filter.date.$gte = new Date(from)
      if (to) filter.date.$lte = new Date(to)
    }

    if (source) filter.source = source

    const income = await Income.find(filter).sort({ date: -1 })
    res.json(income)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get income summary
router.get('/summary', authRequired, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id)
    const { from, to } = req.query

    const match = { user: userId }
    if (from || to) {
      match.date = {}
      if (from) match.date.$gte = new Date(from)
      if (to) match.date.$lte = new Date(to)
    }

    const [bySource, byMonth, total] = await Promise.all([
      Income.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$source',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Income.aggregate([
        { $match: match },
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
      ]),
      Income.aggregate([
        { $match: match },
        {
          $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } },
        },
      ]),
    ])

    res.json({
      bySource,
      byMonth: byMonth.map((m) => ({
        month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
        total: m.total,
      })),
      total: total[0]?.total || 0,
      count: total[0]?.count || 0,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create income
router.post('/', authRequired, async (req, res) => {
  try {
    const { amount, source, description, date, isRecurring, frequency } =
      req.body

    const income = await Income.create({
      user: req.user.id,
      amount,
      source,
      description,
      date: date || new Date(),
      isRecurring: isRecurring || false,
      frequency: frequency || 'one-time',
    })

    res.status(201).json(income)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update income
router.put('/:id', authRequired, async (req, res) => {
  try {
    const { amount, source, description, date, isRecurring, frequency } =
      req.body

    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { amount, source, description, date, isRecurring, frequency },
      { new: true, runValidators: true }
    )

    if (!income) {
      return res.status(404).json({ message: 'Income not found' })
    }

    res.json(income)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete income
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!income) {
      return res.status(404).json({ message: 'Income not found' })
    }

    res.json({ message: 'Income deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete all income for the current user
router.delete('/', authRequired, async (req, res) => {
  try {
    const result = await Income.deleteMany({ user: req.user.id })
    res.json({ ok: true, deletedCount: result.deletedCount })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete income' })
  }
})

module.exports = router
