import { useEffect, useState } from 'react'
import { api } from '../context/AuthContext'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Stack,
  Switch,
  FormControlLabel,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Notifications as NotificationIcon,
  NotificationsActive as AlertIcon,
  CalendarToday as CalendarIcon,
  Assessment as ReportIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Email as EmailIcon,
  PhonelinkRing as PushIcon,
} from '@mui/icons-material'

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null
}

export default function Notifications() {
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState(null)
  const [spendingAlerts, setSpendingAlerts] = useState([])
  const [billReminders, setBillReminders] = useState([])
  const [summaryData, setSummaryData] = useState(null)

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [prefsRes, alertsRes, remindersRes, summaryRes] = await Promise.all(
        [
          api.get('/api/notifications/preferences'),
          api.get('/api/notifications/spending-alerts'),
          api.get('/api/notifications/bill-reminders'),
          api.get('/api/notifications/summary-report?period=week'),
        ]
      )

      console.log('Bill Reminders API Response:', remindersRes.data)
      console.log('Preferences:', prefsRes.data)
      setPreferences(prefsRes.data)
      setSpendingAlerts(alertsRes.data.alerts || [])
      setBillReminders(remindersRes.data.reminders || [])
      setSummaryData(summaryRes.data)
    } catch (error) {
      console.error('Failed to load notifications:', error)
      setSnackbar({
        open: true,
        message: 'Failed to load notification data',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    try {
      setSaving(true)
      await api.put('/api/notifications/preferences', preferences)
      setSnackbar({
        open: true,
        message: 'Notification preferences saved!',
        severity: 'success',
      })
    } catch (error) {
      console.error('Failed to save preferences:', error)
      setSnackbar({
        open: true,
        message: 'Failed to save preferences',
        severity: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = (section, field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Notifications & Reminders
      </Typography>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<AlertIcon />} label="Active Alerts" iconPosition="start" />
        <Tab
          icon={<NotificationIcon />}
          label="Settings"
          iconPosition="start"
        />
        <Tab icon={<ReportIcon />} label="Summary" iconPosition="start" />
      </Tabs>

      {/* Tab 1: Active Alerts */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Spending Alerts */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <WarningIcon color="warning" />
                <Typography variant="h6" fontWeight={600}>
                  Spending Alerts
                </Typography>
                <Chip
                  label={spendingAlerts.length}
                  color="warning"
                  size="small"
                />
              </Stack>
              <Divider sx={{ mb: 2 }} />

              {spendingAlerts.length === 0 ? (
                <Alert severity="success" icon={<SuccessIcon />}>
                  Great! You're within all your budget limits.
                </Alert>
              ) : (
                <List>
                  {spendingAlerts.map((alert, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <Card
                        variant="outlined"
                        sx={{
                          width: '100%',
                          borderLeft: 4,
                          borderColor:
                            alert.severity === 'error'
                              ? 'error.main'
                              : 'warning.main',
                        }}
                      >
                        <CardContent>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                          >
                            <Typography variant="subtitle1" fontWeight={600}>
                              {alert.category}
                            </Typography>
                            <Chip
                              label={`${alert.percentage}%`}
                              color={alert.severity}
                              size="small"
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {alert.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            mt={1}
                          >
                            ${alert.spent.toFixed(2)} / $
                            {alert.limit.toFixed(2)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Bill Reminders */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <CalendarIcon color="info" />
                <Typography variant="h6" fontWeight={600}>
                  Bill Reminders
                </Typography>
                <Chip label={billReminders.length} color="info" size="small" />
              </Stack>
              <Divider sx={{ mb: 2 }} />

              {billReminders.length === 0 ? (
                <Alert severity="info" icon={<InfoIcon />}>
                  No upcoming bills in the next few days.
                </Alert>
              ) : (
                <List>
                  {billReminders.map((reminder, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <Card variant="outlined" sx={{ width: '100%' }}>
                        <CardContent>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                          >
                            <Typography variant="subtitle1" fontWeight={600}>
                              {reminder.description}
                            </Typography>
                            <Chip
                              label={`${reminder.daysUntil}d`}
                              color={
                                reminder.daysUntil === 0
                                  ? 'error'
                                  : reminder.daysUntil === 1
                                  ? 'warning'
                                  : 'info'
                              }
                              size="small"
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            {reminder.message}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={2}
                            mt={1}
                            alignItems="center"
                          >
                            <Chip
                              label={reminder.category}
                              size="small"
                              variant="outlined"
                            />
                            <Typography variant="subtitle2" color="primary">
                              ${reminder.amount.toFixed(2)}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Settings */}
      <TabPanel value={tabValue} index={1}>
        <Stack spacing={3}>
          {/* Spending Alerts Settings */}
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <WarningIcon color="warning" />
              <Typography variant="h6" fontWeight={600}>
                Spending Alerts
              </Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences?.spendingAlerts?.enabled || false}
                      onChange={(e) =>
                        updatePreference(
                          'spendingAlerts',
                          'enabled',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Enable Spending Alerts"
                />
              </Grid>

              {preferences?.spendingAlerts?.enabled && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Alert Threshold (%)"
                      type="number"
                      value={preferences?.spendingAlerts?.threshold || 80}
                      onChange={(e) =>
                        updatePreference(
                          'spendingAlerts',
                          'threshold',
                          Number(e.target.value)
                        )
                      }
                      helperText="Alert when spending reaches this % of budget"
                      InputProps={{
                        inputProps: { min: 0, max: 100 },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Notification Methods
                    </Typography>
                    <Stack spacing={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={
                              preferences?.spendingAlerts?.email || false
                            }
                            onChange={(e) =>
                              updatePreference(
                                'spendingAlerts',
                                'email',
                                e.target.checked
                              )
                            }
                          />
                        }
                        label={
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <EmailIcon fontSize="small" />
                            <span>Email Notifications</span>
                          </Stack>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences?.spendingAlerts?.push || false}
                            onChange={(e) =>
                              updatePreference(
                                'spendingAlerts',
                                'push',
                                e.target.checked
                              )
                            }
                          />
                        }
                        label={
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <PushIcon fontSize="small" />
                            <span>Push Notifications</span>
                          </Stack>
                        }
                      />
                    </Stack>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>

          {/* Bill Reminders Settings */}
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <CalendarIcon color="info" />
              <Typography variant="h6" fontWeight={600}>
                Bill Reminders
              </Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences?.billReminders?.enabled || false}
                      onChange={(e) =>
                        updatePreference(
                          'billReminders',
                          'enabled',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Enable Bill Reminders"
                />
              </Grid>

              {preferences?.billReminders?.enabled && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Remind Me (days before)"
                      type="number"
                      value={
                        preferences?.billReminders?.daysBeforeReminder || 3
                      }
                      onChange={(e) =>
                        updatePreference(
                          'billReminders',
                          'daysBeforeReminder',
                          Number(e.target.value)
                        )
                      }
                      helperText="How many days before the bill is due"
                      InputProps={{
                        inputProps: { min: 1, max: 30 },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Notification Methods
                    </Typography>
                    <Stack spacing={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences?.billReminders?.email || false}
                            onChange={(e) =>
                              updatePreference(
                                'billReminders',
                                'email',
                                e.target.checked
                              )
                            }
                          />
                        }
                        label={
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <EmailIcon fontSize="small" />
                            <span>Email Notifications</span>
                          </Stack>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={preferences?.billReminders?.push || false}
                            onChange={(e) =>
                              updatePreference(
                                'billReminders',
                                'push',
                                e.target.checked
                              )
                            }
                          />
                        }
                        label={
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <PushIcon fontSize="small" />
                            <span>Push Notifications</span>
                          </Stack>
                        }
                      />
                    </Stack>
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>

          {/* Summary Reports Settings */}
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <ReportIcon color="success" />
              <Typography variant="h6" fontWeight={600}>
                Summary Reports
              </Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences?.summaryReports?.enabled || false}
                      onChange={(e) =>
                        updatePreference(
                          'summaryReports',
                          'enabled',
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Enable Summary Reports"
                />
              </Grid>

              {preferences?.summaryReports?.enabled && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Report Frequency"
                      value={preferences?.summaryReports?.frequency || 'weekly'}
                      onChange={(e) =>
                        updatePreference(
                          'summaryReports',
                          'frequency',
                          e.target.value
                        )
                      }
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </TextField>
                  </Grid>

                  {preferences?.summaryReports?.frequency === 'weekly' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label="Day of Week"
                        value={preferences?.summaryReports?.dayOfWeek || 1}
                        onChange={(e) =>
                          updatePreference(
                            'summaryReports',
                            'dayOfWeek',
                            Number(e.target.value)
                          )
                        }
                      >
                        <MenuItem value={0}>Sunday</MenuItem>
                        <MenuItem value={1}>Monday</MenuItem>
                        <MenuItem value={2}>Tuesday</MenuItem>
                        <MenuItem value={3}>Wednesday</MenuItem>
                        <MenuItem value={4}>Thursday</MenuItem>
                        <MenuItem value={5}>Friday</MenuItem>
                        <MenuItem value={6}>Saturday</MenuItem>
                      </TextField>
                    </Grid>
                  )}

                  {preferences?.summaryReports?.frequency === 'monthly' && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Day of Month"
                        type="number"
                        value={preferences?.summaryReports?.dayOfMonth || 1}
                        onChange={(e) =>
                          updatePreference(
                            'summaryReports',
                            'dayOfMonth',
                            Number(e.target.value)
                          )
                        }
                        InputProps={{
                          inputProps: { min: 1, max: 28 },
                        }}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences?.summaryReports?.email || false}
                          onChange={(e) =>
                            updatePreference(
                              'summaryReports',
                              'email',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <EmailIcon fontSize="small" />
                          <span>Send via Email</span>
                        </Stack>
                      }
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Paper>

          {/* Save Button */}
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSavePreferences}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </Box>
        </Stack>
      </TabPanel>

      {/* Tab 3: Summary */}
      <TabPanel value={tabValue} index={2}>
        {summaryData && (
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Weekly Summary
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        Total Spent
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="primary">
                        ${summaryData.totalSpent.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {summaryData.totalExpenses} transactions
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" mb={2}>
                        Top Categories
                      </Typography>
                      <Stack spacing={1}>
                        {summaryData.categoryBreakdown
                          .slice(0, 3)
                          .map((cat, index) => (
                            <Box key={index}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                mb={0.5}
                              >
                                <Typography variant="body2">
                                  {cat.category}
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  ${cat.total.toFixed(2)} ({cat.percentage}%)
                                </Typography>
                              </Stack>
                            </Box>
                          ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Budget Status
              </Typography>
              <Grid container spacing={2}>
                {summaryData.budgetStatus.map((budget, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          mb={1}
                        >
                          <Typography variant="subtitle2">
                            {budget.category}
                          </Typography>
                          <Chip
                            label={`${budget.percentage}%`}
                            color={
                              budget.percentage >= 100
                                ? 'error'
                                : budget.percentage >= 80
                                ? 'warning'
                                : 'success'
                            }
                            size="small"
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          ${budget.spent.toFixed(2)} / $
                          {budget.limit.toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Stack>
        )}
      </TabPanel>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
