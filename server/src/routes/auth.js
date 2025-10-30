const express = require('express')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { authRequired } = require('../middleware/auth')

const router = express.Router()

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d',
  })
}

const registerValidators = [
  body('name').isString().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
]

router.post('/register', registerValidators, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  try {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing)
      return res.status(409).json({ message: 'Email already in use' })
    const user = await User.create({ name, email, password })
    const token = signToken(user)
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return res.status(201).json({ user: user.toJSON(), token })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

const loginValidators = [body('email').isEmail(), body('password').isString()]

router.post('/login', loginValidators, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await user.comparePassword(password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const token = signToken(user)
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return res.json({ user: user.toJSON(), token })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out' })
})

// Get current user profile
router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json({ user })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Update user profile
router.put(
  '/profile',
  authRequired,
  [
    body('name').optional().isString().isLength({ min: 2 }),
    body('email').optional().isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() })

    try {
      const { name, email } = req.body
      const user = await User.findById(req.user.id)
      if (!user) return res.status(404).json({ message: 'User not found' })

      // Check if email is already taken by another user
      if (email && email !== user.email) {
        const existing = await User.findOne({ email })
        if (existing) {
          return res.status(409).json({ message: 'Email already in use' })
        }
      }

      if (name) user.name = name
      if (email) user.email = email

      await user.save()
      return res.json({ user: user.toJSON() })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Server error' })
    }
  }
)

// Change password
router.put(
  '/password',
  authRequired,
  [
    body('currentPassword').isString(),
    body('newPassword').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() })

    try {
      const { currentPassword, newPassword } = req.body
      const user = await User.findById(req.user.id)
      if (!user) return res.status(404).json({ message: 'User not found' })

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: 'Current password is incorrect' })
      }

      user.password = newPassword
      await user.save()

      return res.json({ message: 'Password updated successfully' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Server error' })
    }
  }
)

module.exports = router
