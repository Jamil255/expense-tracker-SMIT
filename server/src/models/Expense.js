const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    date: { type: Date, required: true },
    receipt: { type: String, trim: true }, // Base64 encoded image or URL
  },
  { timestamps: true }
)

expenseSchema.index({ user: 1, date: -1 })

module.exports = mongoose.model('Expense', expenseSchema)
