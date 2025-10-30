import { Outlet, Link, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import {
  Container,
  Breadcrumbs,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

export default function App() {
  const loc = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const showExpenses = loc.pathname.includes('expenses')
  const showProfile = loc.pathname.includes('profile')
  const showAnalytics = loc.pathname.includes('analytics')
  const showFinancial = loc.pathname.includes('financial')
  const showNotifications = loc.pathname.includes('notifications')
  const showSettings = loc.pathname.includes('settings')

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar />
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 },
          flex: 1,
        }}
      >
        {!isMobile && (
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 2 }}
          >
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                color:
                  loc.pathname === '/' ? theme.palette.primary.main : 'inherit',
              }}
            >
              Dashboard
            </Link>
            {showExpenses && (
              <Link
                to="/expenses"
                style={{
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                }}
              >
                Expenses
              </Link>
            )}
            {showAnalytics && (
              <Link
                to="/analytics"
                style={{
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                }}
              >
                Analytics
              </Link>
            )}
            {showFinancial && (
              <Link
                to="/financial"
                style={{
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                }}
              >
                Financial
              </Link>
            )}
            {showNotifications && (
              <Link
                to="/notifications"
                style={{
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                }}
              >
                Notifications
              </Link>
            )}
            {showSettings && (
              <Link
                to="/settings"
                style={{
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                }}
              >
                Settings
              </Link>
            )}
            {showProfile && (
              <Link
                to="/profile"
                style={{
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                }}
              >
                Profile
              </Link>
            )}
          </Breadcrumbs>
        )}
        <Outlet />
      </Container>
      <Footer />
    </Box>
  )
}
