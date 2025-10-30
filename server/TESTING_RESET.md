# Testing: Reset Notification Throttle

## Option 1: MongoDB Compass

1. Open MongoDB Compass
2. Go to `notificationpreferences` collection
3. Find your user document
4. Delete or set `lastSpendingAlertSent` to null
5. Save

## Option 2: MongoDB Shell

```javascript
db.notificationpreferences.updateMany(
  {},
  { $unset: { lastSpendingAlertSent: '' } }
)
```

## Option 3: Add API Endpoint (Temporary)

Add this route in notifications.js for testing:

```javascript
// TESTING ONLY - Remove in production
router.delete('/reset-throttle', authRequired, async (req, res) => {
  await NotificationPreference.findOneAndUpdate(
    { user: req.user.id },
    { $unset: { lastSpendingAlertSent: '' } }
  )
  res.json({ message: 'Throttle reset' })
})
```

Then call: DELETE /api/notifications/reset-throttle
