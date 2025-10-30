import { useEffect, useMemo, useState } from 'react'
import { api } from '../context/AuthContext'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseTable from '../components/ExpenseTable'
import {
  Paper,
  Stack,
  TextField,
  Select,
  MenuItem,
  Button,
  Chip,
  CircularProgress,
  Typography,
  Fade,
  Grow,
  Badge,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import WarningIcon from '@mui/icons-material/Warning'

export default function Expenses() {
  const [items, setItems] = useState([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [category, setCategory] = useState('')
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [budgetStatus, setBudgetStatus] = useState([])
  const [budgetWarning, setBudgetWarning] = useState({
    open: false,
    message: '',
    budgetData: null,
    pendingExpense: null,
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  const load = async (filters = {}) => {
    setLoading(true)
    const params = {}

    // Use provided filters or current state
    const fromDate = filters.from !== undefined ? filters.from : from
    const toDate = filters.to !== undefined ? filters.to : to
    const cat = filters.category !== undefined ? filters.category : category

    if (fromDate) params.from = fromDate
    if (toDate) params.to = toDate
    if (cat) params.category = cat

    try {
      const { data } = await api.get('/api/expenses', { params })
      setItems(data.items)
    } catch (error) {
      console.error('Failed to load expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    loadBudgetStatus()
  }, [])

  const loadBudgetStatus = async () => {
    try {
      const { data } = await api.get('/api/budgets/status')
      setBudgetStatus(data)
    } catch (error) {
      console.error('Failed to load budget status:', error)
    }
  }

  const categories = useMemo(
    () => Array.from(new Set(items.map((i) => i.category))).filter(Boolean),
    [items]
  )

  const onAdd = async (payload) => {
    // Check budget before adding
    const budgetCheck = checkBudget(payload)
    if (budgetCheck.warning) {
      setBudgetWarning({
        open: true,
        message: budgetCheck.message,
        budgetData: budgetCheck.budgetData,
        pendingExpense: payload,
      })
      return
    }

    await api.post('/api/expenses', payload)
    setEditing(null)
    setSnackbar({
      open: true,
      message: 'Expense added successfully!',
      severity: 'success',
    })
    await load()
    await loadBudgetStatus()
  }

  const checkBudget = (expense) => {
    const categoryBudget = budgetStatus.find(
      (b) => b.budget.category.toLowerCase() === expense.category.toLowerCase()
    )

    if (!categoryBudget) {
      return { warning: false }
    }

    const newSpent = categoryBudget.spent + parseFloat(expense.amount)
    const newPercentage = (newSpent / categoryBudget.budget.limit) * 100

    if (newSpent > categoryBudget.budget.limit) {
      return {
        warning: true,
        message: `This expense will exceed your ${
          expense.category
        } budget by $${(newSpent - categoryBudget.budget.limit).toFixed(2)}!`,
        budgetData: {
          ...categoryBudget,
          newSpent,
          newPercentage,
          exceeded: newSpent - categoryBudget.budget.limit,
        },
      }
    }

    if (newPercentage >= categoryBudget.budget.alertThreshold) {
      return {
        warning: true,
        message: `This expense will bring you to ${newPercentage.toFixed(
          0
        )}% of your ${expense.category} budget (${
          categoryBudget.budget.alertThreshold
        }% threshold)!`,
        budgetData: {
          ...categoryBudget,
          newSpent,
          newPercentage,
        },
      }
    }

    return { warning: false }
  }

  const handleConfirmExpense = async () => {
    if (budgetWarning.pendingExpense) {
      await api.post('/api/expenses', budgetWarning.pendingExpense)
      setEditing(null)
      setSnackbar({
        open: true,
        message: 'Expense added successfully!',
        severity: 'success',
      })
      await load()
      await loadBudgetStatus()
    }
    setBudgetWarning({
      open: false,
      message: '',
      budgetData: null,
      pendingExpense: null,
    })
  }

  const onUpdate = async (payload) => {
    if (!editing) return
    try {
      await api.put(`/api/expenses/${editing._id}`, payload)
      setEditing(null)
      setSnackbar({
        open: true,
        message: 'Expense updated successfully!',
        severity: 'success',
      })
      await load()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update expense',
        severity: 'error',
      })
    }
    await loadBudgetStatus()
  }

  const onDelete = async (e) => {
    try {
      await api.delete(`/api/expenses/${e._id}`)
      setSnackbar({
        open: true,
        message: 'Expense deleted successfully!',
        severity: 'success',
      })
      await load()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete expense',
        severity: 'error',
      })
    }
    await loadBudgetStatus()
  }

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.amount, 0),
    [items]
  )

  const activeFiltersCount = [from, to, category].filter(Boolean).length

  return (
    <>
      <Stack spacing={3}>
        <Fade in timeout={300}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              background: editing
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              transition: 'all 0.5s ease',
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
              mb={2}
            >
              <AddCircleOutlineIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
              <Typography variant={{ xs: 'h6', sm: 'h5' }} fontWeight={700}>
                {editing ? 'Edit Expense' : 'Add New Expense'}
              </Typography>
            </Stack>
            <ExpenseForm
              onSubmit={editing ? onUpdate : onAdd}
              initial={editing}
              suggestions={categories}
            />
            {editing && (
              <Button
                variant="outlined"
                onClick={() => setEditing(null)}
                sx={{
                  mt: 2,
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Cancel Edit
              </Button>
            )}
          </Paper>
        </Fade>

        <Grow in timeout={500}>
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              mb={3}
              spacing={{ xs: 1, sm: 0 }}
            >
              <Typography variant="h6" fontWeight={600}>
                Expense List
              </Typography>
              <Stack
                direction="row"
                spacing={{ xs: 1, sm: 2 }}
                alignItems="center"
                flexWrap="wrap"
              >
                <Typography variant="body2" color="text.secondary">
                  Total: <strong>${totalAmount.toFixed(2)}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Count: <strong>{items.length}</strong>
                </Typography>
              </Stack>
            </Stack>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', md: 'center' }}
              mb={2}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Badge badgeContent={activeFiltersCount} color="primary">
                  <FilterListIcon color="action" />
                </Badge>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  Filters
                </Typography>
              </Stack>

              <TextField
                type="date"
                label="From"
                InputLabelProps={{ shrink: true }}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                size="small"
                sx={{ width: { xs: '100%', md: 180 } }}
              />

              <TextField
                type="date"
                label="To"
                InputLabelProps={{ shrink: true }}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                size="small"
                sx={{ width: { xs: '100%', md: 180 } }}
              />

              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                displayEmpty
                size="small"
                sx={{ width: { xs: '100%', md: 200 } }}
              >
                <MenuItem value="">
                  <em>All categories</em>
                </MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>

              <Button
                variant="contained"
                onClick={load}
                disabled={loading}
                startIcon={<FilterListIcon />}
                sx={{
                  minWidth: { xs: '100%', md: 120 },
                }}
              >
                Apply
              </Button>

              <Tooltip title="Clear all filters">
                <IconButton
                  onClick={() => {
                    setFrom('')
                    setTo('')
                    setCategory('')
                    setEditing(null)
                    load({ from: '', to: '', category: '' })
                  }}
                  color="error"
                  sx={{
                    display: { xs: 'none', md: 'inline-flex' },
                  }}
                >
                  <ClearAllIcon />
                </IconButton>
              </Tooltip>

              <Button
                variant="outlined"
                onClick={() => {
                  setFrom('')
                  setTo('')
                  setCategory('')
                  setEditing(null)
                  load({ from: '', to: '', category: '' })
                }}
                color="error"
                startIcon={<ClearAllIcon />}
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  width: '100%',
                }}
              >
                Clear
              </Button>

              {loading && <CircularProgress size={24} />}
            </Stack>

            {items.length === 0 && !loading ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 6,
                  textAlign: 'center',
                  bgcolor: 'grey.50',
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No expenses found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add your first expense using the form above
                </Typography>
              </Paper>
            ) : (
              <ExpenseTable
                items={items}
                onEdit={setEditing}
                onDelete={onDelete}
              />
            )}
          </Paper>
        </Grow>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Budget Warning Dialog */}
      <Dialog
        open={budgetWarning.open}
        onClose={() =>
          setBudgetWarning({
            open: false,
            message: '',
            budgetData: null,
            pendingExpense: null,
          })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Budget Alert
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="warning" variant="outlined">
              {budgetWarning.message}
            </Alert>

            {budgetWarning.budgetData && (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Budget Summary:
                </Typography>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      Current Spent:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${budgetWarning.budgetData.spent.toFixed(2)} / $
                      {budgetWarning.budgetData.budget.limit.toFixed(2)}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      New Total:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={
                        budgetWarning.budgetData.exceeded
                          ? 'error.main'
                          : 'warning.main'
                      }
                    >
                      ${budgetWarning.budgetData.newSpent.toFixed(2)} (
                      {budgetWarning.budgetData.newPercentage.toFixed(0)}%)
                    </Typography>
                  </Stack>
                  {budgetWarning.budgetData.exceeded && (
                    <Chip
                      label={`Over budget by $${budgetWarning.budgetData.exceeded.toFixed(
                        2
                      )}`}
                      color="error"
                      size="small"
                      icon={<WarningIcon />}
                    />
                  )}
                </Stack>
              </Paper>
            )}

            <DialogContentText>
              Do you still want to add this expense?
            </DialogContentText>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setBudgetWarning({
                open: false,
                message: '',
                budgetData: null,
                pendingExpense: null,
              })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmExpense}
            variant="contained"
            color="warning"
          >
            Add Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
