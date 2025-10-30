const mongoose = require('mongoose')

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'yearly', 'one-time'],
      default: 'one-time',
    },
  },
  { timestamps: true }
)

incomeSchema.index({ user: 1, date: -1 })

module.exports = mongoose.model('Income', incomeSchema)
