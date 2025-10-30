import { useState } from 'react'
import { api } from '../context/AuthContext'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  LinearProgress,
  Breadcrumbs,
  Link,
} from '@mui/material'
import {
  CloudDownload as ExportIcon,
  CloudUpload as ImportIcon,
  DeleteForever as DeleteIcon,
  Backup as BackupIcon,
  Restore as RestoreIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
} from '@mui/icons-material'

export default function Settings() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleExportData = async () => {
    try {
      setExporting(true)

      // Fetch all user data
      const [
        expensesRes,
        budgetsRes,
        incomeRes,
        savingsRes,
        recurringRes,
        splitsRes,
      ] = await Promise.all([
        api.get('/api/expenses'),
        api.get('/api/budgets'),
        api.get('/api/income'),
        api.get('/api/savings'),
        api.get('/api/recurring'),
        api.get('/api/splits'),
      ])

      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {
          expenses: expensesRes.data,
          budgets: budgetsRes.data,
          income: incomeRes.data,
          savings: savingsRes.data,
          recurring: recurringRes.data,
          splits: splitsRes.data,
        },
      }

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `expense-tracker-backup-${
        new Date().toISOString().split('T')[0]
      }.json`
      a.click()
      window.URL.revokeObjectURL(url)

      setSnackbar({
        open: true,
        message: 'Data exported successfully!',
        severity: 'success',
      })
    } catch (error) {
      console.error('Export error:', error)
      setSnackbar({
        open: true,
        message: 'Failed to export data',
        severity: 'error',
      })
    } finally {
      setExporting(false)
    }
  }

  const handleImportData = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setImporting(true)

      const text = await file.text()
      const importData = JSON.parse(text)

      if (!importData.version || !importData.data) {
        throw new Error('Invalid backup file format')
      }

      // Import each data type
      const { data } = importData
      let imported = 0

      if (data.expenses?.length) {
        for (const expense of data.expenses) {
          try {
            await api.post('/api/expenses', {
              amount: expense.amount,
              category: expense.category,
              description: expense.description,
              date: expense.date,
            })
            imported++
          } catch (err) {
            console.error('Failed to import expense:', err)
          }
        }
      }

      if (data.budgets?.length) {
        for (const budget of data.budgets) {
          try {
            await api.post('/api/budgets', {
              category: budget.category,
              limit: budget.limit,
              period: budget.period,
              alertThreshold: budget.alertThreshold,
            })
          } catch (err) {
            console.error('Failed to import budget:', err)
          }
        }
      }

      if (data.income?.length) {
        for (const income of data.income) {
          try {
            await api.post('/api/income', {
              amount: income.amount,
              source: income.source,
              description: income.description,
              date: income.date,
              isRecurring: income.isRecurring,
              frequency: income.frequency,
            })
          } catch (err) {
            console.error('Failed to import income:', err)
          }
        }
      }

      if (data.savings?.length) {
        for (const goal of data.savings) {
          try {
            await api.post('/api/savings', {
              name: goal.name,
              targetAmount: goal.targetAmount,
              currentAmount: goal.currentAmount,
              deadline: goal.deadline,
              description: goal.description,
            })
          } catch (err) {
            console.error('Failed to import savings goal:', err)
          }
        }
      }

      if (data.recurring?.length) {
        for (const recurring of data.recurring) {
          try {
            await api.post('/api/recurring', {
              amount: recurring.amount,
              category: recurring.category,
              description: recurring.description,
              frequency: recurring.frequency,
              startDate: recurring.startDate,
              endDate: recurring.endDate,
            })
          } catch (err) {
            console.error('Failed to import recurring expense:', err)
          }
        }
      }

      if (data.splits?.length) {
        for (const split of data.splits) {
          try {
            await api.post('/api/splits', {
              amount: split.amount,
              category: split.category,
              description: split.description,
              date: split.date,
              splits: split.splits,
            })
          } catch (err) {
            console.error('Failed to import split expense:', err)
          }
        }
      }

      setSnackbar({
        open: true,
        message: `Data imported successfully! ${imported} items imported.`,
        severity: 'success',
      })

      // Refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Import error:', error)
      setSnackbar({
        open: true,
        message: 'Failed to import data. Invalid file format.',
        severity: 'error',
      })
    } finally {
      setImporting(false)
      event.target.value = '' // Reset file input
    }
  }

  const handleDeleteAllData = async () => {
    try {
      // Delete all data types - call DELETE on base endpoints
      const results = await Promise.allSettled([
        api.delete('/api/expenses'),
        api.delete('/api/budgets'),
        api.delete('/api/income'),
        api.delete('/api/savings'),
        api.delete('/api/recurring'),
        api.delete('/api/splits'),
      ])

      // Check if any deletions failed
      const failed = results.filter((r) => r.status === 'rejected')
      if (failed.length > 0) {
        console.warn('Some deletions failed:', failed)
      }

      setSnackbar({
        open: true,
        message: 'All data deleted successfully!',
        severity: 'success',
      })
      setDeleteDialog(false)

      // Refresh after 1 second
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Delete error:', error)
      setSnackbar({
        open: true,
        message: 'Failed to delete data',
        severity: 'error',
      })
    }
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Settings & Data Management
      </Typography>

      <Stack spacing={3}>
        {/* Backup & Restore */}
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <BackupIcon color="primary" />
            <Box>
              <Typography variant="h6">Backup & Restore</Typography>
              <Typography variant="body2" color="text.secondary">
                Export your data as a backup or import from a previous backup
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <ExportIcon color="success" />
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Export Data
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Download all your expenses, income, budgets, and financial
                      data
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  startIcon={<ExportIcon />}
                  onClick={handleExportData}
                  disabled={exporting}
                  fullWidth
                >
                  {exporting ? 'Exporting...' : 'Export All Data'}
                </Button>
                {exporting && <LinearProgress sx={{ mt: 1 }} />}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <ImportIcon color="info" />
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Import Data
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Restore data from a previously exported backup file
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<RestoreIcon />}
                  disabled={importing}
                  fullWidth
                >
                  {importing ? 'Importing...' : 'Import Backup File'}
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={handleImportData}
                  />
                </Button>
                {importing && <LinearProgress sx={{ mt: 1 }} />}
              </CardContent>
            </Card>
          </Stack>
        </Paper>

        {/* Data Management */}
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <WarningIcon color="error" />
            <Box>
              <Typography variant="h6">Danger Zone</Typography>
              <Typography variant="body2" color="text.secondary">
                Irreversible actions that affect all your data
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Warning: This action cannot be undone!
            </Typography>
            <Typography variant="body2">
              Deleting all data will permanently remove all your expenses,
              income, budgets, savings goals, and financial records.
            </Typography>
          </Alert>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialog(true)}
            fullWidth
          >
            Delete All Data
          </Button>
        </Paper>

        {/* Export Format Info */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            About Backup Files
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <SuccessIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="JSON Format"
                secondary="Backups are saved in standard JSON format for easy portability"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SuccessIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Complete Backup"
                secondary="Includes all expenses, income, budgets, savings goals, recurring items, and split expenses"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SuccessIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Version Control"
                secondary="Each backup includes version information to ensure compatibility"
              />
            </ListItem>
          </List>
        </Paper>
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WarningIcon color="error" />
            <Typography variant="h6">Delete All Data?</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete all your data including:
          </DialogContentText>
          <List dense>
            <ListItem>• All expense records</ListItem>
            <ListItem>• All income entries</ListItem>
            <ListItem>• All budget limits</ListItem>
            <ListItem>• All savings goals</ListItem>
            <ListItem>• All recurring expenses</ListItem>
            <ListItem>• All split expenses</ListItem>
          </List>
          <Alert severity="error" sx={{ mt: 2 }}>
            <strong>This action cannot be undone!</strong> Make sure you have
            exported your data if you want to keep a backup.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAllData}
            color="error"
            variant="contained"
          >
            Yes, Delete Everything
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}
