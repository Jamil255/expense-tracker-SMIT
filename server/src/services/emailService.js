const nodemailer = require('nodemailer')

// Create email transporter
// For development, you can use services like:
// - Gmail (requires app password)
// - Mailtrap (testing)
// - SendGrid, Mailgun, AWS SES (production)

let transporter = null

// Initialize email transporter
const initializeTransporter = () => {
  if (transporter) return transporter

  // Option 1: Gmail (requires app password)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use app password, not regular password
    },
  })

  return transporter
}

// Verify email transporter connection
const verifyEmailConnection = async () => {
  try {
    const transporter = initializeTransporter()
    await transporter.verify()
    console.log('✅ Email server is ready to send messages')
    return true
  } catch (error) {
    console.error('❌ Email server connection failed:', error.message)
    return false
  }
}

// Send spending alert email
const sendSpendingAlertEmail = async (userEmail, alert) => {
  try {
    // Validate email address
    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      console.error('Invalid email address:', userEmail)
      return { success: false, error: 'Invalid email address' }
    }

    const transporter = initializeTransporter()

    const mailOptions = {
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `⚠️ Spending Alert: ${alert.category}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: ${
              alert.severity === 'error' ? '#fee' : '#fff4e5'
            }; border-left: 4px solid ${
        alert.severity === 'error' ? '#f44336' : '#ff9800'
      }; padding: 15px; margin: 20px 0; }
            .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💸 Spending Alert</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <h2 style="margin-top: 0;">Budget Alert: ${alert.category}</h2>
                <p style="font-size: 18px; margin: 10px 0;">${alert.message}</p>
              </div>
              
              <div class="stats">
                <div class="stat-row">
                  <span><strong>Category:</strong></span>
                  <span>${alert.category}</span>
                </div>
                <div class="stat-row">
                  <span><strong>Spent:</strong></span>
                  <span>$${alert.spent.toFixed(2)}</span>
                </div>
                <div class="stat-row">
                  <span><strong>Budget Limit:</strong></span>
                  <span>$${alert.limit.toFixed(2)}</span>
                </div>
                <div class="stat-row" style="border: none;">
                  <span><strong>Percentage:</strong></span>
                  <span style="color: ${
                    alert.severity === 'error' ? '#f44336' : '#ff9800'
                  }; font-weight: bold;">${alert.percentage}%</span>
                </div>
              </div>

              <p>
                ${
                  alert.severity === 'error'
                    ? '🚨 You have exceeded your budget limit. Consider reviewing your expenses or adjusting your budget.'
                    : '⚠️ You are approaching your budget limit. Keep an eye on your spending to stay within budget.'
                }
              </p>

              <a href="${
                process.env.CLIENT_ORIGIN || 'http://localhost:5173'
              }/analytics" class="button">
                View Budget Details
              </a>
            </div>
            <div class="footer">
              <p>You received this email because you have spending alerts enabled.</p>
              <p>Manage your notification preferences in Settings.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Spending alert email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending spending alert email:', error)
    return { success: false, error: error.message }
  }
}

// Send bill reminder email
const sendBillReminderEmail = async (userEmail, reminder) => {
  try {
    // Validate email address
    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      console.error('Invalid email address:', userEmail)
      return { success: false, error: 'Invalid email address' }
    }

    const transporter = initializeTransporter()

    const mailOptions = {
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `📅 Bill Reminder: ${reminder.description}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
            .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .button { display: inline-block; background: #2196f3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📅 Bill Reminder</h1>
            </div>
            <div class="content">
              <div class="reminder-box">
                <h2 style="margin-top: 0;">${reminder.description}</h2>
                <p style="font-size: 18px; margin: 10px 0;">${
                  reminder.message
                }</p>
              </div>
              
              <div class="stats">
                <div class="stat-row">
                  <span><strong>Bill Name:</strong></span>
                  <span>${reminder.description}</span>
                </div>
                <div class="stat-row">
                  <span><strong>Amount:</strong></span>
                  <span style="color: #2196f3; font-weight: bold;">$${reminder.amount.toFixed(
                    2
                  )}</span>
                </div>
                <div class="stat-row">
                  <span><strong>Category:</strong></span>
                  <span>${reminder.category}</span>
                </div>
                <div class="stat-row" style="border: none;">
                  <span><strong>Due Date:</strong></span>
                  <span>${new Date(
                    reminder.dueDate
                  ).toLocaleDateString()}</span>
                </div>
              </div>

              <p>
                💡 <strong>Tip:</strong> Make sure you have sufficient funds available for this payment.
              </p>

              <a href="${
                process.env.CLIENT_ORIGIN || 'http://localhost:5173'
              }/financial" class="button">
                View Recurring Expenses
              </a>
            </div>
            <div class="footer">
              <p>You received this email because you have bill reminders enabled.</p>
              <p>Manage your notification preferences in Settings.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Bill reminder email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending bill reminder email:', error)
    return { success: false, error: error.message }
  }
}

// Send summary report email
const sendSummaryReportEmail = async (userEmail, summaryData) => {
  try {
    // Validate email address
    if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      console.error('Invalid email address:', userEmail)
      return { success: false, error: 'Invalid email address' }
    }

    const transporter = initializeTransporter()

    const topCategories = summaryData.categoryBreakdown.slice(0, 5)

    const mailOptions = {
      from: `"Expense Tracker" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `📊 Your ${summaryData.period} Expense Summary`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .summary-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .big-number { font-size: 48px; font-weight: bold; color: #667eea; margin: 10px 0; }
            .category-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .category-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
            .budget-status { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Expense Summary</h1>
              <p style="margin: 0; opacity: 0.9;">${new Date(
                summaryData.startDate
              ).toLocaleDateString()} - ${new Date(
        summaryData.endDate
      ).toLocaleDateString()}</p>
            </div>
            <div class="content">
              <div class="summary-card">
                <h3 style="margin-top: 0; color: #666;">Total Spent</h3>
                <div class="big-number">$${summaryData.totalSpent.toFixed(
                  2
                )}</div>
                <p style="color: #999; margin: 0;">${
                  summaryData.totalExpenses
                } transactions</p>
              </div>

              <h3>Top Categories</h3>
              <div class="category-list">
                ${topCategories
                  .map(
                    (cat) => `
                  <div class="category-item">
                    <span><strong>${cat.category}</strong> (${
                      cat.count
                    } items)</span>
                    <span style="color: #667eea; font-weight: bold;">$${cat.total.toFixed(
                      2
                    )} (${cat.percentage}%)</span>
                  </div>
                `
                  )
                  .join('')}
              </div>

              ${
                summaryData.budgetStatus.length > 0
                  ? `
                <h3>Budget Status</h3>
                ${summaryData.budgetStatus
                  .map(
                    (budget) => `
                  <div class="budget-status" style="border-color: ${
                    budget.percentage >= 100
                      ? '#f44336'
                      : budget.percentage >= 80
                      ? '#ff9800'
                      : '#4caf50'
                  };">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <strong>${budget.category}</strong>
                      <span style="color: ${
                        budget.percentage >= 100
                          ? '#f44336'
                          : budget.percentage >= 80
                          ? '#ff9800'
                          : '#4caf50'
                      }; font-weight: bold;">
                        ${budget.percentage}%
                      </span>
                    </div>
                    <div style="font-size: 14px; color: #666; margin-top: 5px;">
                      $${budget.spent.toFixed(2)} / $${budget.limit.toFixed(2)}
                      ${
                        budget.remaining >= 0
                          ? `<span style="color: #4caf50;"> • $${budget.remaining.toFixed(
                              2
                            )} remaining</span>`
                          : `<span style="color: #f44336;"> • $${Math.abs(
                              budget.remaining
                            ).toFixed(2)} over budget</span>`
                      }
                    </div>
                  </div>
                `
                  )
                  .join('')}
              `
                  : ''
              }

              <div style="text-align: center;">
                <a href="${
                  process.env.CLIENT_ORIGIN || 'http://localhost:5173'
                }/analytics" class="button">
                  View Detailed Analytics
                </a>
              </div>
            </div>
            <div class="footer">
              <p>You received this email as part of your scheduled expense summary.</p>
              <p>Manage your notification preferences in Settings.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Summary report email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending summary report email:', error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  sendSpendingAlertEmail,
  sendBillReminderEmail,
  sendSummaryReportEmail,
  verifyEmailConnection,
}
