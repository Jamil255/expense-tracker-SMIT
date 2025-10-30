import { useEffect, useState } from 'react'
import { api } from '../context/AuthContext'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Collapse,
  InputAdornment,
  FormControlLabel,
  Switch,
  CircularProgress,
  Skeleton,
  Fade,
  Zoom,
  Slide,
  Backdrop,
  Badge,
  Breadcrumbs,
  Link,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as IncomeIcon,
  Savings as SavingsIcon,
  Repeat as RecurringIcon,
  People as SplitIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Paid as PaidIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  SwapVert as SortIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  TrendingDown as ExpenseIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
} from '@mui/icons-material'

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null
}

export default function Financial() {
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  // Filters and Search
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })
  const [sortOrder, setSortOrder] = useState('desc')
  const [showCompleted, setShowCompleted] = useState(true)
  const [showActive, setShowActive] = useState(true)

  // Income
  const [income, setIncome] = useState([])
  const [incomeSummary, setIncomeSummary] = useState(null)
  const [incomeDialog, setIncomeDialog] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)
  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    source: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    frequency: 'one-time',
  })

  // Savings Goals
  const [goals, setGoals] = useState([])
  const [goalDialog, setGoalDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [contributionDialog, setContributionDialog] = useState(false)
  const [contributionAmount, setContributionAmount] = useState('')
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [goalForm, setGoalForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    description: '',
  })

  // Recurring Expenses
  const [recurring, setRecurring] = useState([])
  const [recurringDialog, setRecurringDialog] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState(null)
  const [recurringForm, setRecurringForm] = useState({
    amount: '',
    category: '',
    description: '',
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  })

  // Split Expenses
  const [splits, setSplits] = useState([])
  const [splitDialog, setSplitDialog] = useState(false)
  const [editingSplit, setEditingSplit] = useState(null)
  const [splitForm, setSplitForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    splits: [{ name: '', email: '', amount: '', isPaid: false }],
  })

  useEffect(() => {
    loadFinancialData()
  }, [])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadFinancialData()
    }, 300000)
    return () => clearInterval(interval)
  }, [])

  const loadFinancialData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)

      const [incomeRes, incomeSummaryRes, goalsRes, recurringRes, splitsRes] =
        await Promise.all([
          api.get('/api/income'),
          api.get('/api/income/summary'),
          api.get('/api/savings'),
          api.get('/api/recurring'),
          api.get('/api/splits'),
        ])

      setIncome(incomeRes.data)
      setIncomeSummary(incomeSummaryRes.data)
      setGoals(goalsRes.data)
      setRecurring(recurringRes.data)
      setSplits(splitsRes.data)
    } catch (error) {
      console.error('Failed to load financial data:', error)
      setSnackbar({
        open: true,
        message: 'Failed to load data',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter and search functions
  const filterIncome = () => {
    return income
      .filter((item) => {
        const matchesSearch =
          item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesDate =
          (!dateFilter.start ||
            new Date(item.date) >= new Date(dateFilter.start)) &&
          (!dateFilter.end || new Date(item.date) <= new Date(dateFilter.end))

        return matchesSearch && matchesDate
      })
      .sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      })
  }

  const filterGoals = () => {
    return goals.filter((goal) => {
      const matchesSearch = goal.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesCompleted = showCompleted || goal.status !== 'completed'
      const matchesActive = showActive || goal.status === 'completed'
      return matchesSearch && matchesCompleted && matchesActive
    })
  }

  const filterRecurring = () => {
    return recurring.filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesActive =
        (showActive && item.isActive) ||
        (!showActive && !item.isActive) ||
        (showActive && showCompleted)
      return matchesSearch && matchesActive
    })
  }

  const filterSplits = () => {
    return splits.filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSettled =
        (showCompleted && item.isSettled) || !item.isSettled
      return matchesSearch && matchesSettled
    })
  }

  const exportToCSV = () => {
    let csvContent = ''
    let filename = ''

    switch (tabValue) {
      case 0:
        csvContent = 'Date,Source,Description,Type,Amount\n'
        filterIncome().forEach((item) => {
          csvContent += `${new Date(item.date).toLocaleDateString()},${
            item.source
          },${item.description},${
            item.isRecurring ? item.frequency : 'one-time'
          },${item.amount}\n`
        })
        filename = 'income.csv'
        break
      case 1:
        csvContent = 'Goal,Target,Current,Progress,Status\n'
        filterGoals().forEach((goal) => {
          const progress = (
            (goal.currentAmount / goal.targetAmount) *
            100
          ).toFixed(2)
          csvContent += `${goal.name},${goal.targetAmount},${goal.currentAmount},${progress}%,${goal.status}\n`
        })
        filename = 'savings_goals.csv'
        break
      case 2:
        csvContent =
          'Description,Category,Frequency,Amount,Next Occurrence,Status\n'
        filterRecurring().forEach((item) => {
          csvContent += `${item.description},${item.category},${
            item.frequency
          },${item.amount},${new Date(
            item.nextOccurrence
          ).toLocaleDateString()},${item.isActive ? 'Active' : 'Inactive'}\n`
        })
        filename = 'recurring_expenses.csv'
        break
      case 3:
        csvContent = 'Description,Category,Total,Paid,Owed,Status\n'
        filterSplits().forEach((split) => {
          csvContent += `${split.description},${split.category},${
            split.amount
          },${split.totalPaid},${split.totalOwed},${
            split.isSettled ? 'Settled' : 'Pending'
          }\n`
        })
        filename = 'split_expenses.csv'
        break
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    setSnackbar({
      open: true,
      message: 'Exported successfully!',
      severity: 'success',
    })
  }

  // Income Functions
  const handleSaveIncome = async () => {
    try {
      if (!incomeForm.amount || !incomeForm.source) {
        setSnackbar({
          open: true,
          message: 'Please fill required fields',
          severity: 'error',
        })
        return
      }

      // Determine if it's recurring based on frequency
      const isRecurring = incomeForm.frequency !== 'one-time'
      const dataToSave = {
        ...incomeForm,
        isRecurring,
      }

      if (editingIncome) {
        await api.put(`/api/income/${editingIncome._id}`, dataToSave)
        setSnackbar({
          open: true,
          message: 'Income updated!',
          severity: 'success',
        })
      } else {
        await api.post('/api/income', dataToSave)
        setSnackbar({
          open: true,
          message: 'Income added!',
          severity: 'success',
        })
      }

      setIncomeDialog(false)
      setEditingIncome(null)
      setIncomeForm({
        amount: '',
        source: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        frequency: 'one-time',
      })
      loadFinancialData()
    } catch (error) {
      console.error('Save income error:', error)
      setSnackbar({
        open: true,
        message: 'Failed to save income',
        severity: 'error',
      })
    }
  }

  const handleDeleteIncome = async (id) => {
    if (!window.confirm('Delete this income?')) return
    try {
      await api.delete(`/api/income/${id}`)
      setSnackbar({
        open: true,
        message: 'Income deleted!',
        severity: 'success',
      })
      loadFinancialData()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete',
        severity: 'error',
      })
    }
  }

  // Savings Goal Functions
  const handleSaveGoal = async () => {
    try {
      if (!goalForm.name || !goalForm.targetAmount) {
        setSnackbar({
          open: true,
          message: 'Please fill required fields',
          severity: 'error',
        })
        return
      }

      if (editingGoal) {
        await api.put(`/api/savings/${editingGoal._id}`, goalForm)
        setSnackbar({
          open: true,
          message: 'Goal updated!',
          severity: 'success',
        })
      } else {
        await api.post('/api/savings', goalForm)
        setSnackbar({
          open: true,
          message: 'Goal created!',
          severity: 'success',
        })
      }

      setGoalDialog(false)
      setEditingGoal(null)
      setGoalForm({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: '',
        description: '',
      })
      loadFinancialData()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save goal',
        severity: 'error',
      })
    }
  }

  const handleContribute = async () => {
    try {
      if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
        setSnackbar({
          open: true,
          message: 'Enter valid amount',
          severity: 'error',
        })
        return
      }

      await api.post(`/api/savings/${selectedGoal._id}/contribute`, {
        amount: parseFloat(contributionAmount),
      })

      setSnackbar({
        open: true,
        message: 'Contribution added!',
        severity: 'success',
      })
      setContributionDialog(false)
      setContributionAmount('')
      setSelectedGoal(null)
      loadFinancialData()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to add contribution',
        severity: 'error',
      })
    }
  }

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this savings goal?')) return
    try {
      await api.delete(`/api/savings/${id}`)
      setSnackbar({ open: true, message: 'Goal deleted!', severity: 'success' })
      loadFinancialData()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete',
        severity: 'error',
      })
    }
  }

  // Recurring Expense Functions
  const handleSaveRecurring = async () => {
    try {
      if (
        !recurringForm.amount ||
        !recurringForm.category ||
        !recurringForm.description
      ) {
        setSnackbar({
          open: true,
          message: 'Please fill required fields',
          severity: 'error',
        })
        return
      }

      if (editingRecurring) {
        await api.put(`/api/recurring/${editingRecurring._id}`, recurringForm)
        setSnackbar({
          open: true,
          message: 'Recurring expense updated!',
          severity: 'success',
        })
      } else {
        await api.post('/api/recurring', recurringForm)
        setSnackbar({
          open: true,
          message: 'Recurring expense created!',
          severity: 'success',
        })
      }

      setRecurringDialog(false)
      setEditingRecurring(null)
      setRecurringForm({
        amount: '',
        category: '',
        description: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      })
      loadFinancialData()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save recurring expense',
        severity: 'error',
      })
    }
  }

  const handleProcessRecurring = async () => {
    try {
      const { data } = await api.post('/api/recurring/process')
      setSnackbar({ open: true, message: data.message, severity: 'success' })
      loadFinancialData()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to process',
        severity: 'error',
      })
    }
  }

  const handleDeleteRecurring = async (id) => {
    if (!window.confirm('Delete this recurring expense?')) return
    try {
      await api.delete(`/api/recurring/${id}`)
      setSnackbar({
        open: true,
        message: 'Recurring expense deleted!',
        severity: 'success',
      })
      loadFinancialData()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete',
        severity: 'error',
      })
    }
  }

  // Split Expense Functions
  const handleSaveSplit = async () => {
    try {
      if (!splitForm.amount || !splitForm.category || !splitForm.description) {
        setSnackbar({
          open: true,
          message: 'Please fill required fields',
          severity: 'error',
        })
        return
      }

      if (editingSplit) {
        await api.put(`/api/splits/${editingSplit._id}`, splitForm)
        setSnackbar({
          open: true,
          message: 'Split expense updated!',
          severity: 'success',
        })
      } else {
        await api.post('/api/splits', splitForm)
        setSnackbar({
          open: true,
          message: 'Split expense created!',
          severity: 'success',
        })
      }

      setSplitDialog(false)
      setEditingSplit(null)
      setSplitForm({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        splits: [{ name: '', email: '', amount: '', isPaid: false }],
      })
      loadFinancialData()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save split expense',
        severity: 'error',
      })
    }
  }

  const handleTogglePaid = async (splitId, splitIndex, isPaid) => {
    try {
      if (isPaid) {
        await api.post(`/api/splits/${splitId}/unpay/${splitIndex}`)
      } else {
        await api.post(`/api/splits/${splitId}/pay/${splitIndex}`)
      }
      setSnackbar({
        open: true,
        message: `Marked as ${isPaid ? 'unpaid' : 'paid'}!`,
        severity: 'success',
      })
      loadFinancialData()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update status',
        severity: 'error',
      })
    }
  }

  const handleDeleteSplit = async (id) => {
    if (!window.confirm('Delete this split expense?')) return
    try {
      await api.delete(`/api/splits/${id}`)
      setSnackbar({
        open: true,
        message: 'Split expense deleted!',
        severity: 'success',
      })
      loadFinancialData()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete',
        severity: 'error',
      })
    }
  }

  const addSplitPerson = () => {
    setSplitForm({
      ...splitForm,
      splits: [
        ...splitForm.splits,
        { name: '', email: '', amount: '', isPaid: false },
      ],
    })
  }

  const removeSplitPerson = (index) => {
    const newSplits = splitForm.splits.filter((_, i) => i !== index)
    setSplitForm({ ...splitForm, splits: newSplits })
  }

  const updateSplitPerson = (index, field, value) => {
    const newSplits = [...splitForm.splits]
    newSplits[index][field] = value
    setSplitForm({ ...splitForm, splits: newSplits })
  }

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" mb={3}>
          Financial Management
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={150} />
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight="bold">
          Financial Management
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={() => loadFinancialData()} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to CSV">
            <IconButton onClick={exportToCSV} color="primary">
              <ExportIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Search and Filter Bar */}
      <Fade in>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Tooltip title={showFilters ? 'Hide Filters' : 'Show Filters'}>
                <IconButton
                  onClick={() => setShowFilters(!showFilters)}
                  color="primary"
                >
                  <FilterIcon />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={sortOrder === 'desc' ? 'Oldest First' : 'Newest First'}
              >
                <IconButton
                  onClick={() =>
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                  }
                  color="primary"
                >
                  <SortIcon />
                </IconButton>
              </Tooltip>
            </Stack>

            <Collapse in={showFilters}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  size="small"
                  value={dateFilter.start}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, start: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150 }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  size="small"
                  value={dateFilter.end}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, end: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 150 }}
                />
                {tabValue === 1 && (
                  <>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showCompleted}
                          onChange={(e) => setShowCompleted(e.target.checked)}
                          size="small"
                        />
                      }
                      label="Show Completed"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showActive}
                          onChange={(e) => setShowActive(e.target.checked)}
                          size="small"
                        />
                      }
                      label="Show Active"
                    />
                  </>
                )}
                {tabValue === 2 && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showActive}
                        onChange={(e) => setShowActive(e.target.checked)}
                        size="small"
                      />
                    }
                    label="Active Only"
                  />
                )}
                {tabValue === 3 && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showCompleted}
                        onChange={(e) => setShowCompleted(e.target.checked)}
                        size="small"
                      />
                    }
                    label="Show Settled"
                  />
                )}
                <Button
                  size="small"
                  onClick={() => {
                    setSearchTerm('')
                    setDateFilter({ start: '', end: '' })
                    setShowCompleted(true)
                    setShowActive(true)
                  }}
                >
                  Clear Filters
                </Button>
              </Stack>
            </Collapse>
          </Stack>
        </Paper>
      </Fade>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label={
              <Badge badgeContent={filterIncome().length} color="primary">
                <Box sx={{ px: 1 }}>Income</Box>
              </Badge>
            }
            icon={<IncomeIcon />}
            iconPosition="start"
          />
          <Tab
            label={
              <Badge badgeContent={filterGoals().length} color="primary">
                <Box sx={{ px: 1 }}>Savings Goals</Box>
              </Badge>
            }
            icon={<SavingsIcon />}
            iconPosition="start"
          />
          <Tab
            label={
              <Badge badgeContent={filterRecurring().length} color="primary">
                <Box sx={{ px: 1 }}>Recurring</Box>
              </Badge>
            }
            icon={<RecurringIcon />}
            iconPosition="start"
          />
          <Tab
            label={
              <Badge badgeContent={filterSplits().length} color="primary">
                <Box sx={{ px: 1 }}>Split Expenses</Box>
              </Badge>
            }
            icon={<SplitIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Income Tab */}
      <TabPanel value={tabValue} index={0}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={2}
          mb={2}
        >
          <Box>
            <Typography variant="h6">Income Tracking</Typography>
            <Typography variant="caption" color="text.secondary">
              {filterIncome().length} income{' '}
              {filterIncome().length === 1 ? 'entry' : 'entries'}
            </Typography>
          </Box>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => {
              setEditingIncome(null)
              setIncomeForm({
                amount: '',
                source: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                isRecurring: false,
                frequency: 'one-time',
              })
              setIncomeDialog(true)
            }}
          >
            Add Income
          </Button>
        </Stack>

        {incomeSummary && (
          <Zoom in>
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    background:
                      'linear-gradient(135deg, #43a047 0%, #66bb6a 100%)',
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography
                          color="white"
                          variant="body2"
                          sx={{ opacity: 0.9 }}
                        >
                          Total Income
                        </Typography>
                        <Typography variant="h4" fontWeight={700} color="white">
                          ${incomeSummary.total.toFixed(2)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="white"
                          sx={{ opacity: 0.8 }}
                        >
                          {incomeSummary.count} transactions
                        </Typography>
                      </Box>
                      <IncomeIcon
                        sx={{ fontSize: 50, color: 'white', opacity: 0.3 }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={8}>
                <Card>
                  <CardContent>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={1}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Income Sources
                      </Typography>
                      <Tooltip title="Breakdown of income by source">
                        <InfoIcon fontSize="small" color="action" />
                      </Tooltip>
                    </Stack>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {incomeSummary.bySource.map((source) => (
                        <Tooltip
                          key={source._id}
                          title={`${source.count} transactions`}
                        >
                          <Chip
                            label={`${source._id}: $${source.total.toFixed(2)}`}
                            color="success"
                            variant="outlined"
                          />
                        </Tooltip>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Zoom>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filterIncome().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No income records found. Add your first income entry!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filterIncome().map((item, index) => (
                  <Fade in key={item._id} timeout={300 + index * 50}>
                    <TableRow hover>
                      <TableCell>
                        {new Date(item.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={item.source}>
                          <Typography variant="body2" fontWeight={600}>
                            {item.source}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 200 }}
                        >
                          {item.description || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.isRecurring ? item.frequency : 'one-time'}
                          size="small"
                          color={item.isRecurring ? 'primary' : 'default'}
                          icon={
                            item.isRecurring ? <RecurringIcon /> : undefined
                          }
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, color: 'success.main' }}
                      >
                        ${item.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingIncome(item)
                                setIncomeForm({
                                  amount: item.amount,
                                  source: item.source,
                                  description: item.description || '',
                                  date: new Date(item.date)
                                    .toISOString()
                                    .split('T')[0],
                                  isRecurring: item.isRecurring,
                                  frequency: item.frequency || 'one-time',
                                })
                                setIncomeDialog(true)
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteIncome(item._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  </Fade>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Savings Goals Tab */}
      <TabPanel value={tabValue} index={1}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={2}
          mb={2}
        >
          <Box>
            <Typography variant="h6">Savings Goals</Typography>
            <Typography variant="caption" color="text.secondary">
              {filterGoals().length}{' '}
              {filterGoals().length === 1 ? 'goal' : 'goals'} • Track your
              financial targets
            </Typography>
          </Box>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => {
              setEditingGoal(null)
              setGoalForm({
                name: '',
                targetAmount: '',
                currentAmount: '',
                deadline: '',
                description: '',
              })
              setGoalDialog(true)
            }}
          >
            Create Goal
          </Button>
        </Stack>

        {filterGoals().length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <SavingsIcon
              sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No savings goals yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Create your first savings goal to start tracking your progress!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filterGoals().map((goal, index) => {
              const percentage = (goal.currentAmount / goal.targetAmount) * 100
              const remaining = goal.targetAmount - goal.currentAmount
              const isCompleted = goal.status === 'completed'

              const daysLeft = goal.deadline
                ? Math.ceil(
                    (new Date(goal.deadline) - new Date()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null

              return (
                <Grid item xs={12} md={6} key={goal._id}>
                  <Zoom in timeout={300 + index * 100}>
                    <Card
                      sx={{
                        height: '100%',
                        border: isCompleted ? '2px solid' : 'none',
                        borderColor: 'success.main',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardContent>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          mb={2}
                        >
                          <Box>
                            <Typography variant="h6" fontWeight={600}>
                              {goal.name}
                            </Typography>
                            {goal.deadline && (
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Deadline:{' '}
                                  {new Date(goal.deadline).toLocaleDateString()}
                                </Typography>
                                {daysLeft !== null &&
                                  daysLeft > 0 &&
                                  daysLeft <= 30 && (
                                    <Tooltip
                                      title={`${daysLeft} days remaining`}
                                    >
                                      <Chip
                                        label={`${daysLeft}d`}
                                        size="small"
                                        color="warning"
                                        icon={<WarningIcon />}
                                      />
                                    </Tooltip>
                                  )}
                              </Stack>
                            )}
                          </Box>
                          <Stack direction="row" spacing={0.5}>
                            {isCompleted && (
                              <Chip
                                label="Completed"
                                color="success"
                                size="small"
                                icon={<CheckIcon />}
                              />
                            )}
                            <Tooltip title="Edit Goal">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingGoal(goal)
                                  setGoalForm({
                                    name: goal.name,
                                    targetAmount: goal.targetAmount,
                                    currentAmount: goal.currentAmount,
                                    deadline: goal.deadline
                                      ? new Date(goal.deadline)
                                          .toISOString()
                                          .split('T')[0]
                                      : '',
                                    description: goal.description || '',
                                  })
                                  setGoalDialog(true)
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Goal">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteGoal(goal._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>

                        {goal.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2}
                          >
                            {goal.description}
                          </Typography>
                        )}

                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2">
                              ${goal.currentAmount.toFixed(2)} / $
                              {goal.targetAmount.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {percentage.toFixed(0)}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(percentage, 100)}
                            sx={{ height: 10, borderRadius: 1 }}
                            color={isCompleted ? 'success' : 'primary'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            ${remaining > 0 ? remaining.toFixed(2) : 0}{' '}
                            remaining
                          </Typography>
                        </Stack>

                        {!isCompleted && (
                          <Button
                            fullWidth
                            variant="outlined"
                            sx={{ mt: 2 }}
                            onClick={() => {
                              setSelectedGoal(goal)
                              setContributionDialog(true)
                            }}
                          >
                            Add Contribution
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              )
            })}
          </Grid>
        )}
      </TabPanel>

      {/* Recurring Expenses Tab */}
      <TabPanel value={tabValue} index={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={2}
          mb={2}
        >
          <Box>
            <Typography variant="h6">Recurring Expenses</Typography>
            <Typography variant="caption" color="text.secondary">
              {filterRecurring().length} recurring{' '}
              {filterRecurring().length === 1 ? 'expense' : 'expenses'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Create expenses for due recurring items">
              <Button
                variant="outlined"
                onClick={handleProcessRecurring}
                size="small"
                startIcon={<RefreshIcon />}
              >
                Process Due
              </Button>
            </Tooltip>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => {
                setEditingRecurring(null)
                setRecurringForm({
                  amount: '',
                  category: '',
                  description: '',
                  frequency: 'monthly',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: '',
                })
                setRecurringDialog(true)
              }}
            >
              Add Recurring
            </Button>
          </Stack>
        </Stack>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Next Occurrence</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filterRecurring().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <RecurringIcon
                      sx={{ fontSize: 50, color: 'text.secondary', mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      No recurring expenses found. Add your first recurring
                      bill!
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filterRecurring().map((item, index) => {
                  const isDue = new Date(item.nextOccurrence) <= new Date()

                  return (
                    <Fade in key={item._id} timeout={300 + index * 50}>
                      <TableRow
                        hover
                        sx={{
                          bgcolor: isDue ? 'warning.lighter' : 'inherit',
                        }}
                      >
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            {isDue && (
                              <Tooltip title="Due for processing">
                                <WarningIcon color="warning" fontSize="small" />
                              </Tooltip>
                            )}
                            <Typography variant="body2" fontWeight={600}>
                              {item.description}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={item.category} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.frequency}
                            size="small"
                            variant="outlined"
                            icon={<RecurringIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={
                              isDue
                                ? 'This expense is due!'
                                : 'Next occurrence date'
                            }
                          >
                            <Typography
                              variant="body2"
                              color={isDue ? 'warning.main' : 'text.primary'}
                              fontWeight={isDue ? 600 : 400}
                            >
                              {new Date(
                                item.nextOccurrence
                              ).toLocaleDateString()}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>
                          ${item.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.isActive ? 'Active' : 'Inactive'}
                            color={item.isActive ? 'success' : 'default'}
                            size="small"
                            icon={
                              item.isActive ? <CheckIcon /> : <CancelIcon />
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingRecurring(item)
                                  setRecurringForm({
                                    amount: item.amount,
                                    category: item.category,
                                    description: item.description,
                                    frequency: item.frequency,
                                    startDate: new Date(item.startDate)
                                      .toISOString()
                                      .split('T')[0],
                                    endDate: item.endDate
                                      ? new Date(item.endDate)
                                          .toISOString()
                                          .split('T')[0]
                                      : '',
                                  })
                                  setRecurringDialog(true)
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteRecurring(item._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Split Expenses Tab */}
      <TabPanel value={tabValue} index={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={2}
          mb={2}
        >
          <Box>
            <Typography variant="h6">Split Expenses</Typography>
            <Typography variant="caption" color="text.secondary">
              {filterSplits().length} split{' '}
              {filterSplits().length === 1 ? 'expense' : 'expenses'}
            </Typography>
          </Box>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => {
              setEditingSplit(null)
              setSplitForm({
                amount: '',
                category: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                splits: [{ name: '', email: '', amount: '', isPaid: false }],
              })
              setSplitDialog(true)
            }}
          >
            Add Split
          </Button>
        </Stack>

        {filterSplits().length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <SplitIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No split expenses yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Create your first split expense to track shared costs!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filterSplits().map((split, index) => (
              <Grid item xs={12} key={split._id}>
                <Zoom in timeout={300 + index * 100}>
                  <Card
                    sx={{
                      border: split.isSettled ? '2px solid' : 'none',
                      borderColor: 'success.main',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateX(4px)',
                      },
                    }}
                  >
                    <CardContent>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box flex={1}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                            mb={1}
                            flexWrap="wrap"
                          >
                            <Typography variant="h6" fontWeight={600}>
                              {split.description}
                            </Typography>
                            <Chip label={split.category} size="small" />
                            {split.isSettled ? (
                              <Chip
                                label="Settled"
                                color="success"
                                size="small"
                                icon={<CheckIcon />}
                              />
                            ) : (
                              <Chip
                                label="Pending"
                                color="warning"
                                size="small"
                                icon={<WarningIcon />}
                              />
                            )}
                          </Stack>
                          <Stack
                            direction="row"
                            spacing={2}
                            flexWrap="wrap"
                            mb={2}
                          >
                            <Tooltip title="Total expense amount">
                              <Chip
                                label={`Total: $${split.amount.toFixed(2)}`}
                                size="small"
                                variant="outlined"
                              />
                            </Tooltip>
                            <Tooltip title="Amount paid so far">
                              <Chip
                                label={`Paid: $${split.totalPaid.toFixed(2)}`}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            </Tooltip>
                            <Tooltip title="Amount still owed">
                              <Chip
                                label={`Owed: $${split.totalOwed.toFixed(2)}`}
                                size="small"
                                color={
                                  split.totalOwed > 0 ? 'error' : 'default'
                                }
                                variant="outlined"
                              />
                            </Tooltip>
                          </Stack>

                          <List dense>
                            {split.splits.map((person, pIndex) => (
                              <ListItem
                                key={pIndex}
                                sx={{
                                  bgcolor: person.isPaid
                                    ? 'success.lighter'
                                    : 'grey.50',
                                  borderRadius: 1,
                                  mb: 0.5,
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                    >
                                      {person.name}
                                    </Typography>
                                  }
                                  secondary={
                                    <Stack
                                      direction="row"
                                      spacing={1}
                                      alignItems="center"
                                    >
                                      <Typography variant="caption">
                                        {person.email}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        fontWeight={600}
                                      >
                                        ${person.amount.toFixed(2)}
                                      </Typography>
                                    </Stack>
                                  }
                                />
                                <ListItemSecondaryAction>
                                  <Tooltip
                                    title={
                                      person.isPaid
                                        ? 'Mark as unpaid'
                                        : 'Mark as paid'
                                    }
                                  >
                                    <IconButton
                                      edge="end"
                                      onClick={() =>
                                        handleTogglePaid(
                                          split._id,
                                          pIndex,
                                          person.isPaid
                                        )
                                      }
                                      color={
                                        person.isPaid ? 'success' : 'default'
                                      }
                                      sx={{
                                        '&:hover': {
                                          transform: 'scale(1.1)',
                                        },
                                      }}
                                    >
                                      {person.isPaid ? (
                                        <PaidIcon />
                                      ) : (
                                        <CancelIcon />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSplit(split._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Income Dialog */}
      <Dialog
        key={editingIncome?._id || 'new-income'}
        open={incomeDialog}
        onClose={() => {
          setIncomeDialog(false)
          setEditingIncome(null)
          setIncomeForm({
            amount: '',
            source: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            isRecurring: false,
            frequency: 'one-time',
          })
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingIncome ? 'Edit Income' : 'Add Income'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Amount"
              type="number"
              value={incomeForm.amount}
              onChange={(e) =>
                setIncomeForm({ ...incomeForm, amount: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Source"
              value={incomeForm.source}
              onChange={(e) =>
                setIncomeForm({ ...incomeForm, source: e.target.value })
              }
              fullWidth
              required
              placeholder="e.g., Salary, Freelance, Investment"
            />
            <TextField
              label="Description"
              value={incomeForm.description}
              onChange={(e) =>
                setIncomeForm({ ...incomeForm, description: e.target.value })
              }
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Date"
              type="date"
              value={incomeForm.date}
              onChange={(e) =>
                setIncomeForm({ ...incomeForm, date: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Frequency"
              select
              value={incomeForm.frequency || 'one-time'}
              onChange={(e) =>
                setIncomeForm({ ...incomeForm, frequency: e.target.value })
              }
              fullWidth
              SelectProps={{
                native: false,
              }}
            >
              <MenuItem value="one-time">One-time</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="bi-weekly">Bi-weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIncomeDialog(false)
              setEditingIncome(null)
              setIncomeForm({
                amount: '',
                source: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                isRecurring: false,
                frequency: 'one-time',
              })
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSaveIncome} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Savings Goal Dialog */}
      <Dialog
        open={goalDialog}
        onClose={() => setGoalDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingGoal ? 'Edit Goal' : 'Create Savings Goal'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Goal Name"
              value={goalForm.name}
              onChange={(e) =>
                setGoalForm({ ...goalForm, name: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Target Amount"
              type="number"
              value={goalForm.targetAmount}
              onChange={(e) =>
                setGoalForm({ ...goalForm, targetAmount: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Current Amount"
              type="number"
              value={goalForm.currentAmount}
              onChange={(e) =>
                setGoalForm({ ...goalForm, currentAmount: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Deadline"
              type="date"
              value={goalForm.deadline}
              onChange={(e) =>
                setGoalForm({ ...goalForm, deadline: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Description"
              value={goalForm.description}
              onChange={(e) =>
                setGoalForm({ ...goalForm, description: e.target.value })
              }
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGoalDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveGoal} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contribution Dialog */}
      <Dialog
        open={contributionDialog}
        onClose={() => setContributionDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Contribution</DialogTitle>
        <DialogContent>
          {selectedGoal && (
            <Stack spacing={2} mt={1}>
              <Typography variant="body2" color="text.secondary">
                Contributing to: <strong>{selectedGoal.name}</strong>
              </Typography>
              <TextField
                label="Amount"
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                fullWidth
                autoFocus
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContributionDialog(false)}>Cancel</Button>
          <Button onClick={handleContribute} variant="contained">
            Contribute
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recurring Expense Dialog */}
      <Dialog
        open={recurringDialog}
        onClose={() => setRecurringDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingRecurring
            ? 'Edit Recurring Expense'
            : 'Add Recurring Expense'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Amount"
              type="number"
              value={recurringForm.amount}
              onChange={(e) =>
                setRecurringForm({ ...recurringForm, amount: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Category"
              value={recurringForm.category}
              onChange={(e) =>
                setRecurringForm({ ...recurringForm, category: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={recurringForm.description}
              onChange={(e) =>
                setRecurringForm({
                  ...recurringForm,
                  description: e.target.value,
                })
              }
              fullWidth
              required
            />
            <TextField
              label="Frequency"
              select
              value={recurringForm.frequency}
              onChange={(e) =>
                setRecurringForm({
                  ...recurringForm,
                  frequency: e.target.value,
                })
              }
              fullWidth
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="bi-weekly">Bi-weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </TextField>
            <TextField
              label="Start Date"
              type="date"
              value={recurringForm.startDate}
              onChange={(e) =>
                setRecurringForm({
                  ...recurringForm,
                  startDate: e.target.value,
                })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date (Optional)"
              type="date"
              value={recurringForm.endDate}
              onChange={(e) =>
                setRecurringForm({ ...recurringForm, endDate: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecurringDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRecurring} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Split Expense Dialog */}
      <Dialog
        open={splitDialog}
        onClose={() => setSplitDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSplit ? 'Edit Split Expense' : 'Add Split Expense'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Total Amount"
              type="number"
              value={splitForm.amount}
              onChange={(e) =>
                setSplitForm({ ...splitForm, amount: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Category"
              value={splitForm.category}
              onChange={(e) =>
                setSplitForm({ ...splitForm, category: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={splitForm.description}
              onChange={(e) =>
                setSplitForm({ ...splitForm, description: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Date"
              type="date"
              value={splitForm.date}
              onChange={(e) =>
                setSplitForm({ ...splitForm, date: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <Divider />
            <Typography variant="subtitle2">Split Between</Typography>

            {splitForm.splits.map((person, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <TextField
                  label="Name"
                  value={person.name}
                  onChange={(e) =>
                    updateSplitPerson(index, 'name', e.target.value)
                  }
                  size="small"
                  required
                />
                <TextField
                  label="Email"
                  value={person.email}
                  onChange={(e) =>
                    updateSplitPerson(index, 'email', e.target.value)
                  }
                  size="small"
                />
                <TextField
                  label="Amount"
                  type="number"
                  value={person.amount}
                  onChange={(e) =>
                    updateSplitPerson(index, 'amount', e.target.value)
                  }
                  size="small"
                  required
                />
                {splitForm.splits.length > 1 && (
                  <IconButton
                    size="small"
                    onClick={() => removeSplitPerson(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Stack>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={addSplitPerson}
              variant="outlined"
              size="small"
            >
              Add Person
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSplitDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSplit} variant="contained">
            Save
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
