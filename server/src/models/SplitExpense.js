const mongoose = require('mongoose')

const splitExpenseSchema = new mongoose.Schema(
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
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    splits: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        email: {
          type: String,
          trim: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        isPaid: {
          type: Boolean,
          default: false,
        },
        paidDate: {
          type: Date,
        },
      },
    ],
    totalOwed: {
      type: Number,
      default: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    isSettled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

splitExpenseSchema.index({ user: 1, isSettled: 1 })

module.exports = mongoose.model('SplitExpense', splitExpenseSchema)
