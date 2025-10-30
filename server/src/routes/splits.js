const express = require('express')
const { authRequired } = require('../middleware/auth')
const SplitExpense = require('../models/SplitExpense')

const router = express.Router()

// Get all split expenses
router.get('/', authRequired, async (req, res) => {
  try {
    const { isSettled } = req.query
    const filter = { user: req.user.id }

    if (isSettled !== undefined) filter.isSettled = isSettled === 'true'

    const splits = await SplitExpense.find(filter).sort({ date: -1 })
    res.json(splits)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create split expense
router.post('/', authRequired, async (req, res) => {
  try {
    const { amount, category, description, date, splits } = req.body

    const totalOwed = splits.reduce((sum, split) => sum + split.amount, 0)
    const totalPaid = splits
      .filter((s) => s.isPaid)
      .reduce((sum, s) => sum + s.amount, 0)

    const splitExpense = await SplitExpense.create({
      user: req.user.id,
      amount,
      category,
      description,
      date: date || new Date(),
      splits,
      totalOwed,
      totalPaid,
      isSettled: totalPaid === totalOwed,
    })

    res.status(201).json(splitExpense)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update split expense
router.put('/:id', authRequired, async (req, res) => {
  try {
    const { amount, category, description, date, splits } = req.body

    const splitExpense = await SplitExpense.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!splitExpense) {
      return res.status(404).json({ message: 'Split expense not found' })
    }

    if (amount !== undefined) splitExpense.amount = amount
    if (category !== undefined) splitExpense.category = category
    if (description !== undefined) splitExpense.description = description
    if (date !== undefined) splitExpense.date = date
    if (splits !== undefined) {
      splitExpense.splits = splits
      splitExpense.totalOwed = splits.reduce(
        (sum, split) => sum + split.amount,
        0
      )
      splitExpense.totalPaid = splits
        .filter((s) => s.isPaid)
        .reduce((sum, s) => sum + s.amount, 0)
      splitExpense.isSettled = splitExpense.totalPaid === splitExpense.totalOwed
    }

    await splitExpense.save()
    res.json(splitExpense)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Mark split as paid
router.post('/:id/pay/:splitIndex', authRequired, async (req, res) => {
  try {
    const splitExpense = await SplitExpense.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!splitExpense) {
      return res.status(404).json({ message: 'Split expense not found' })
    }

    const splitIndex = parseInt(req.params.splitIndex)

    if (splitIndex < 0 || splitIndex >= splitExpense.splits.length) {
      return res.status(400).json({ message: 'Invalid split index' })
    }

    splitExpense.splits[splitIndex].isPaid = true
    splitExpense.splits[splitIndex].paidDate = new Date()

    splitExpense.totalPaid = splitExpense.splits
      .filter((s) => s.isPaid)
      .reduce((sum, s) => sum + s.amount, 0)
    splitExpense.isSettled = splitExpense.totalPaid === splitExpense.totalOwed

    await splitExpense.save()
    res.json(splitExpense)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Mark split as unpaid
router.post('/:id/unpay/:splitIndex', authRequired, async (req, res) => {
  try {
    const splitExpense = await SplitExpense.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!splitExpense) {
      return res.status(404).json({ message: 'Split expense not found' })
    }

    const splitIndex = parseInt(req.params.splitIndex)

    if (splitIndex < 0 || splitIndex >= splitExpense.splits.length) {
      return res.status(400).json({ message: 'Invalid split index' })
    }

    splitExpense.splits[splitIndex].isPaid = false
    splitExpense.splits[splitIndex].paidDate = null

    splitExpense.totalPaid = splitExpense.splits
      .filter((s) => s.isPaid)
      .reduce((sum, s) => sum + s.amount, 0)
    splitExpense.isSettled = false

    await splitExpense.save()
    res.json(splitExpense)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete split expense
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const splitExpense = await SplitExpense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!splitExpense) {
      return res.status(404).json({ message: 'Split expense not found' })
    }

    res.json({ message: 'Split expense deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete all split expenses for the current user
router.delete('/', authRequired, async (req, res) => {
  try {
    const result = await SplitExpense.deleteMany({ user: req.user.id })
    res.json({ ok: true, deletedCount: result.deletedCount })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete split expenses' })
  }
})

module.exports = router
