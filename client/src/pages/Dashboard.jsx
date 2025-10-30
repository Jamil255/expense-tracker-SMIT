import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../context/AuthContext'
import ChartSpendingOverTime from '../components/ChartSpendingOverTime'
import ChartByCategory from '../components/ChartByCategory'
import {
  Paper,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Grid,
  Box,
  Fade,
  Grow,
  Card,
  CardContent,
  CardActionArea,
  alpha,
  Divider,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CategoryIcon from '@mui/icons-material/Category'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import AssessmentIcon from '@mui/icons-material/Assessment'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

export default function Dashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState({ byCategory: [], byMonth: [] })
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async (filters = {}) => {
    setLoading(true)
    try {
      const params = {}
      const fromDate = filters.from !== undefined ? filters.from : from
      const toDate = filters.to !== undefined ? filters.to : to
      if (fromDate) params.from = fromDate
      if (toDate) params.to = toDate
      const { data } = await api.get('/api/expenses/summary', { params })
      setSummary(data)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setFrom('')
    setTo('')
    load({ from: '', to: '' })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const total = summary.byCategory.reduce((acc, x) => acc + x.total, 0)

  const StatCard = ({ title, value, icon: Icon, delay = 0, gradient }) => (
    <Grow in timeout={500 + delay}>
      <Card
        sx={{
          background: gradient,
          color: 'white',
          height: '100%',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: 8,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '150px',
            height: '150px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)',
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}
              >
                {title}
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
              >
                {value}
              </Typography>
            </Box>
            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(10px)',
                p: { xs: 1, sm: 1.5 },
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: { xs: 24, sm: 28 } }} />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  )

  const QuickActionCard = ({
    title,
    description,
    icon: Icon,
    color,
    onClick,
    delay = 0,
  }) => (
    <Grow in timeout={500 + delay}>
      <Card
        sx={{
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.03)',
            boxShadow: 4,
          },
        }}
      >
        <CardActionArea onClick={onClick} sx={{ height: '100%', p: 2 }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Box
              sx={{
                bgcolor: alpha(color, 0.1),
                color: color,
                p: 2,
                borderRadius: '50%',
                display: 'flex',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'rotate(10deg) scale(1.1)',
                },
              }}
            >
              <Icon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Box>
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              color={color}
            >
              <Typography variant="caption" fontWeight={600}>
                Open
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: 14 }} />
            </Stack>
          </Stack>
        </CardActionArea>
      </Card>
    </Grow>
  )

  return (
    <Stack spacing={3} sx={{ p: { xs: 1, sm: 2, md: 0 } }}>
      {/* Welcome Header */}
      <Fade in timeout={200}>
        <Box sx={{ px: { xs: 1, sm: 0 } }}>
          <Typography
            variant="h4"
            fontWeight={700}
            gutterBottom
            sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
          >
            Welcome Back! 👋
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Here's your financial overview
          </Typography>
        </Box>
      </Fade>

      {/* Filter Section */}
      <Fade in timeout={300}>
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            mx: { xs: 1, sm: 0 },
          }}
        >
          <Typography
            variant="h6"
            fontWeight={600}
            mb={2}
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            📊 Filter Summary Data
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            flexWrap="wrap"
          >
            <TextField
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              size="small"
              label="From"
              InputLabelProps={{ shrink: true }}
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                flex: { xs: '1 1 100%', sm: '0 1 180px' },
              }}
            />
            <TextField
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              size="small"
              label="To"
              InputLabelProps={{ shrink: true }}
              sx={{
                bgcolor: 'white',
                borderRadius: 1,
                flex: { xs: '1 1 100%', sm: '0 1 180px' },
              }}
            />
            <Button
              variant="contained"
              onClick={load}
              disabled={loading}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                flex: { xs: '1 1 100%', sm: '0 1 auto' },
                minWidth: { sm: 120 },
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              Apply
            </Button>
            <Button
              variant="outlined"
              onClick={handleClear}
              sx={{
                borderColor: 'white',
                color: 'white',
                flex: { xs: '1 1 100%', sm: '0 1 auto' },
                minWidth: { sm: 120 },
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Clear
            </Button>
            {loading && <CircularProgress size={24} sx={{ color: 'white' }} />}
          </Stack>
        </Paper>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ px: { xs: 1, sm: 0 } }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Spent"
            value={`$${total.toFixed(2)}`}
            icon={TrendingUpIcon}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Categories"
            value={summary.byCategory.length}
            icon={CategoryIcon}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            delay={100}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <StatCard
            title="Months Tracked"
            value={summary.byMonth.length}
            icon={CalendarMonthIcon}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            delay={200}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ px: { xs: 1, sm: 0 } }}>
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          🚀 Quick Actions
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Add Expense"
              description="Track your spending"
              icon={AddCircleOutlineIcon}
              color="#667eea"
              onClick={() => navigate('/expenses')}
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Analytics"
              description="View insights & trends"
              icon={AssessmentIcon}
              color="#f5576c"
              onClick={() => navigate('/analytics')}
              delay={100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Budget Plans"
              description="Manage your budgets"
              icon={AccountBalanceWalletIcon}
              color="#00f2fe"
              onClick={() => navigate('/financial')}
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Notifications"
              description="Set up alerts"
              icon={NotificationsActiveIcon}
              color="#f093fb"
              onClick={() => navigate('/notifications')}
              delay={300}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Charts Section */}
      <Box sx={{ px: { xs: 1, sm: 0 } }}>
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
        >
          📈 Spending Overview
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} lg={6}>
            <Fade in timeout={600}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                <ChartSpendingOverTime data={summary.byMonth} />
              </Paper>
            </Fade>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Fade in timeout={800}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                <ChartByCategory data={summary.byCategory} />
              </Paper>
            </Fade>
          </Grid>
        </Grid> 
      </Box>
    </Stack>
  )
}
