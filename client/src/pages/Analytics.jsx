import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  TableChart as ExcelIcon,
  PictureAsPdf as PdfIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '../context/AuthContext'

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
]

export default function Analytics() {
  const [budgets, setBudgets] = useState([])
  const [budgetStatus, setBudgetStatus] = useState([])
  const [trends, setTrends] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [categoryAnalysis, setCategoryAnalysis] = useState([])
  const [topExpenses, setTopExpenses] = useState([])
  const [dayOfWeek, setDayOfWeek] = useState([])
  const [loading, setLoading] = useState(true)

  const [budgetDialog, setBudgetDialog] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [budgetForm, setBudgetForm] = useState({
    category: '',
    limit: '',
    period: 'monthly',
    alertThreshold: 80,
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const [
        budgetsRes,
        statusRes,
        trendsRes,
        predictionsRes,
        categoryRes,
        topRes,
        dayRes,
      ] = await Promise.all([
        api.get('/api/budgets'),
        api.get('/api/budgets/status'),
        api.get('/api/analytics/trends'),
        api.get('/api/analytics/predictions'),
        api.get('/api/analytics/category-analysis'),
        api.get('/api/analytics/top-expenses?limit=10'),
        api.get('/api/analytics/day-of-week'),
      ])

      setBudgets(budgetsRes.data)
      setBudgetStatus(statusRes.data)
      setTrends(trendsRes.data)
      setPredictions(predictionsRes.data)
      setCategoryAnalysis(categoryRes.data)
      setTopExpenses(topRes.data)
      setDayOfWeek(dayRes.data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
      setSnackbar({
        open: true,
        message: 'Failed to load analytics',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBudget = async () => {
    try {
      if (!budgetForm.category || !budgetForm.limit) {
        setSnackbar({
          open: true,
          message: 'Please fill all fields',
          severity: 'error',
        })
        return
      }

      if (editingBudget) {
        await api.put(`/api/budgets/${editingBudget._id}`, {
          limit: parseFloat(budgetForm.limit),
          alertThreshold: budgetForm.alertThreshold,
          period: budgetForm.period,
        })
        setSnackbar({
          open: true,
          message: 'Budget updated!',
          severity: 'success',
        })
      } else {
        await api.post('/api/budgets', {
          category: budgetForm.category,
          limit: parseFloat(budgetForm.limit),
          period: budgetForm.period,
          alertThreshold: budgetForm.alertThreshold,
        })
        setSnackbar({
          open: true,
          message: 'Budget created!',
          severity: 'success',
        })
      }

      setBudgetDialog(false)
      setEditingBudget(null)
      setBudgetForm({
        category: '',
        limit: '',
        period: 'monthly',
        alertThreshold: 80,
      })
      loadAnalytics()
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save budget',
        severity: 'error',
      })
    }
  }

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Delete this budget?')) return
    try {
      await api.delete(`/api/budgets/${id}`)
      setSnackbar({
        open: true,
        message: 'Budget deleted!',
        severity: 'success',
      })
      loadAnalytics()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete budget',
        severity: 'error',
      })
    }
  }

  const openEditBudget = (budget) => {
    setEditingBudget(budget)
    setBudgetForm({
      category: budget.category,
      limit: budget.limit,
      period: budget.period,
      alertThreshold: budget.alertThreshold,
    })
    setBudgetDialog(true)
  }

  const exportToPDF = () => {
    setSnackbar({
      open: true,
      message: 'PDF export coming soon!',
      severity: 'info',
    })
  }

  const exportToExcel = () => {
    // Simple CSV export
    const csvContent = [
      ['Category', 'Total', 'Count', 'Avg Amount', 'Percentage'],
      ...categoryAnalysis.map((c) => [
        c.category,
        c.total,
        c.count,
        c.avgAmount,
        c.percentage,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expense-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    setSnackbar({
      open: true,
      message: 'Report exported!',
      severity: 'success',
    })
  }

  if (loading) {
    return (
      <Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Skeleton variant="text" width={300} height={50} />
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rectangular" width={120} height={36} />
            <Skeleton variant="rectangular" width={120} height={36} />
          </Stack>
        </Stack>

        {/* Trends Loading */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Skeleton variant="text" width={200} height={30} />
          <Grid container spacing={3} mt={1}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="80%" height={50} />
                    <Skeleton variant="text" width="50%" />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box mt={3}>
            <Skeleton variant="rectangular" width="100%" height={250} />
          </Box>
        </Paper>

        {/* Predictions Loading */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Skeleton variant="text" width={200} height={30} />
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="80%" height={50} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="80%" height={40} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" width="100%" height={80} />
            </Grid>
          </Grid>
        </Paper>

        {/* Budget Loading */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Skeleton variant="text" width={150} height={30} />
            <Skeleton variant="rectangular" width={120} height={36} />
          </Stack>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} md={6} key={i}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="70%" height={30} />
                    <Skeleton variant="text" width="40%" />
                    <Box mt={2}>
                      <Skeleton variant="text" width="100%" />
                      <Skeleton
                        variant="rectangular"
                        width="100%"
                        height={8}
                        sx={{ my: 1 }}
                      />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Category Analysis Loading */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Skeleton variant="text" width={200} height={30} />
          <Grid container spacing={3} mt={1}>
            <Grid item xs={12} md={6}>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height={300}
              >
                <CircularProgress />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={40} />
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Day of Week Loading */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Skeleton variant="text" width={250} height={30} />
          <Box mt={2}>
            <Skeleton variant="rectangular" width="100%" height={300} />
          </Box>
        </Paper>

        {/* Top Expenses Loading */}
        <Paper sx={{ p: 3 }}>
          <Skeleton variant="text" width={180} height={30} />
          <Stack spacing={1} mt={2}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rectangular" height={50} />
            ))}
          </Stack>
        </Paper>
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
          Analytics & Insights
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<PdfIcon />}
            onClick={exportToPDF}
            variant="outlined"
            size="small"
          >
            Export PDF
          </Button>
          <Button
            startIcon={<ExcelIcon />}
            onClick={exportToExcel}
            variant="outlined"
            size="small"
          >
            Export CSV
          </Button>
        </Stack>
      </Stack>

      {/* Spending Trends */}
      {trends && trends.currentMonth && trends.lastMonth && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            📊 Spending Trends
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    Current Month
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    ${(trends.currentMonth.total || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {trends.currentMonth.count || 0} transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    Last Month
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    ${(trends.lastMonth.total || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {trends.lastMonth.count || 0} transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {(trends.percentageChange || 0) >= 0 ? (
                      <TrendingUpIcon color="error" />
                    ) : (
                      <TrendingDownIcon color="success" />
                    )}
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Change
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        color={
                          (trends.percentageChange || 0) >= 0
                            ? 'error.main'
                            : 'success.main'
                        }
                      >
                        {(trends.percentageChange || 0) >= 0 ? '+' : ''}
                        {(trends.percentageChange || 0).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {trends.monthlyTrend && trends.monthlyTrend.length > 0 && (
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Last 6 Months Trend
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trends.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Total Spent"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Paper>
      )}

      {/* Predictions */}
      {predictions && predictions.prediction !== undefined && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            🔮 Spending Predictions
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Predicted Next Month
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="primary">
                    ${(predictions.prediction || 0).toFixed(2)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    3-Month Average
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    ${(predictions.average || 0).toFixed(2)}
                  </Typography>
                </Box>
                <Chip
                  label={`${(
                    predictions.confidence || 'low'
                  ).toUpperCase()} Confidence`}
                  color={
                    predictions.confidence === 'high' ? 'success' : 'warning'
                  }
                  size="small"
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Alert
                severity={(predictions.trend || 0) > 0 ? 'warning' : 'success'}
              >
                {(predictions.trend || 0) > 0
                  ? `Your spending is trending up by $${Math.abs(
                      predictions.trend || 0
                    ).toFixed(2)} per month`
                  : `Great! Your spending is trending down by $${Math.abs(
                      predictions.trend || 0
                    ).toFixed(2)} per month`}
              </Alert>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Budget Management */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" fontWeight={600}>
            💰 Budget Limits
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            onClick={() => {
              setEditingBudget(null)
              setBudgetForm({
                category: '',
                limit: '',
                period: 'monthly',
                alertThreshold: 80,
              })
              setBudgetDialog(true)
            }}
          >
            Add Budget
          </Button>
        </Stack>

        {budgetStatus.length === 0 ? (
          <Alert severity="info">
            No budgets set. Create one to track your spending limits!
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {budgetStatus.map((status) => (
              <Grid item xs={12} md={6} key={status.budget._id}>
                <Card
                  sx={{
                    border: status.isOverBudget ? 2 : 1,
                    borderColor: status.isOverBudget ? 'error.main' : 'divider',
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box flex={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="h6" fontWeight={600}>
                            {status.budget.category}
                          </Typography>
                          {status.isOverBudget && (
                            <Chip
                              label="Over Budget"
                              color="error"
                              size="small"
                              icon={<WarningIcon />}
                            />
                          )}
                          {status.isNearLimit && !status.isOverBudget && (
                            <Chip
                              label="Near Limit"
                              color="warning"
                              size="small"
                              icon={<WarningIcon />}
                            />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {status.budget.period.charAt(0).toUpperCase() +
                            status.budget.period.slice(1)}{' '}
                          Budget
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => openEditBudget(status.budget)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteBudget(status.budget._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Box mt={2}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        mb={0.5}
                      >
                        <Typography variant="body2">
                          ${(status.spent || 0).toFixed(2)} / $
                          {(status.budget?.limit || 0).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {(status.percentage || 0).toFixed(0)}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(status.percentage || 0, 100)}
                        color={
                          status.isOverBudget
                            ? 'error'
                            : status.isNearLimit
                            ? 'warning'
                            : 'primary'
                        }
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                      {status.isOverBudget ? (
                        <Typography
                          variant="caption"
                          color="error.main"
                          fontWeight={600}
                          mt={0.5}
                        >
                          Exceeded by ${(status.exceeded || 0).toFixed(2)}
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          mt={0.5}
                        >
                          ${(status.remaining || 0).toFixed(2)} remaining
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Category Analysis */}
      {categoryAnalysis.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            📈 Category Analysis
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryAnalysis}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.category}: ${entry.percentage}%`}
                  >
                    {categoryAnalysis.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Avg</TableCell>
                      <TableCell align="right">%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {categoryAnalysis.map((cat) => (
                      <TableRow key={cat.category}>
                        <TableCell>{cat.category}</TableCell>
                        <TableCell align="right">
                          ${(cat.total || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ${(cat.avgAmount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {cat.percentage || 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Day of Week Analysis */}
      {dayOfWeek.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            📅 Spending by Day of Week
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dayOfWeek}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Total Spent" />
              <Bar dataKey="count" fill="#82ca9d" name="Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Top Expenses */}
      {topExpenses.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            🔝 Top 10 Expenses
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topExpenses.map((expense) => (
                  <TableRow key={expense._id}>
                    <TableCell>
                      {new Date(expense.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip label={expense.category} size="small" />
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ${(expense.amount || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Budget Dialog */}
      <Dialog
        open={budgetDialog}
        onClose={() => setBudgetDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingBudget ? 'Edit Budget' : 'Create Budget'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Category"
              value={budgetForm.category}
              onChange={(e) =>
                setBudgetForm({ ...budgetForm, category: e.target.value })
              }
              disabled={!!editingBudget}
              fullWidth
            />
            <TextField
              label="Budget Limit"
              type="number"
              value={budgetForm.limit}
              onChange={(e) =>
                setBudgetForm({ ...budgetForm, limit: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Period"
              select
              value={budgetForm.period}
              onChange={(e) =>
                setBudgetForm({ ...budgetForm, period: e.target.value })
              }
              fullWidth
            >
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </TextField>
            <TextField
              label="Alert Threshold (%)"
              type="number"
              value={budgetForm.alertThreshold}
              onChange={(e) =>
                setBudgetForm({
                  ...budgetForm,
                  alertThreshold: parseInt(e.target.value),
                })
              }
              fullWidth
              helperText="Get alerted when spending reaches this percentage"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBudgetDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveBudget} variant="contained">
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
