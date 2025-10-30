const express = require('express')
const { authRequired } = require('../middleware/auth')
const SavingsGoal = require('../models/SavingsGoal')

const router = express.Router()

// Get all savings goals
router.get('/', authRequired, async (req, res) => {
  try {
    const { status } = req.query
    const filter = { user: req.user.id }

    if (status) filter.status = status

    const goals = await SavingsGoal.find(filter).sort({ createdAt: -1 })
    res.json(goals)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create savings goal
router.post('/', authRequired, async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline, description } =
      req.body

    const goal = await SavingsGoal.create({
      user: req.user.id,
      name,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline,
      description,
    })

    res.status(201).json(goal)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update savings goal
router.put('/:id', authRequired, async (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline, description, status } =
      req.body

    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' })
    }

    if (name !== undefined) goal.name = name
    if (targetAmount !== undefined) goal.targetAmount = targetAmount
    if (currentAmount !== undefined) {
      goal.currentAmount = currentAmount
      if (currentAmount >= goal.targetAmount) {
        goal.status = 'completed'
      }
    }
    if (deadline !== undefined) goal.deadline = deadline
    if (description !== undefined) goal.description = description
    if (status !== undefined) goal.status = status

    await goal.save()
    res.json(goal)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Add to savings goal
router.post('/:id/contribute', authRequired, async (req, res) => {
  try {
    const { amount } = req.body

    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' })
    }

    goal.currentAmount += parseFloat(amount)

    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed'
    }

    await goal.save()
    res.json(goal)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete savings goal
router.delete('/:id', authRequired, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' })
    }

    res.json({ message: 'Goal deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete all savings goals for the current user
router.delete('/', authRequired, async (req, res) => {
  try {
    const result = await SavingsGoal.deleteMany({ user: req.user.id })
    res.json({ ok: true, deletedCount: result.deletedCount })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete savings goals' })
  }
})

module.exports = router
