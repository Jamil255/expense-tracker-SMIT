const mongoose = require('mongoose')

const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    spendingAlerts: {
      enabled: { type: Boolean, default: true },
      threshold: {
        type: Number,
        default: 80,
        min: [0, 'Threshold must be at least 0'],
        max: [100, 'Threshold cannot exceed 100'],
      }, // percentage of budget
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
    },
    billReminders: {
      enabled: { type: Boolean, default: true },
      daysBeforeReminder: {
        type: Number,
        default: 3,
        min: [0, 'Days before reminder must be at least 0'],
        max: [30, 'Days before reminder cannot exceed 30'],
      },
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false },
    },
    summaryReports: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly',
      },
      email: { type: Boolean, default: true },
      dayOfWeek: { type: Number, default: 1 }, // Monday (0=Sunday, 1=Monday, etc.)
      dayOfMonth: { type: Number, default: 1 }, // 1st of month
    },
    lastSpendingAlertSent: { type: Date },
    lastBillReminderSent: { type: Date },
    lastSummaryReportSent: { type: Date },
  },
  { timestamps: true }
)

module.exports = mongoose.model(
  'NotificationPreference',
  notificationPreferenceSchema
)
