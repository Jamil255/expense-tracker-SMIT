import { useState } from 'react'
import {
  Link as RouterLink,
  NavLink,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useThemeMode } from '../context/ThemeContext'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Stack,
  Link,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useMediaQuery,
  useTheme,
  Avatar,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ReceiptIcon from '@mui/icons-material/Receipt'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import CloseIcon from '@mui/icons-material/Close'
import PersonIcon from '@mui/icons-material/Person'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import SettingsIcon from '@mui/icons-material/Settings'
import NotificationsIcon from '@mui/icons-material/Notifications'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { mode, toggleTheme } = useThemeMode()
  const isAuthed =
    user || (typeof window !== 'undefined' && localStorage.getItem('token'))
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    setDrawerOpen(false)
  }

  const menuItems = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { text: 'Expenses', path: '/expenses', icon: <ReceiptIcon /> },
    { text: 'Analytics', path: '/analytics', icon: <AnalyticsIcon /> },
    {
      text: 'Financial',
      path: '/financial',
      icon: <AccountBalanceWalletIcon />,
    },
    {
      text: 'Notifications',
      path: '/notifications',
      icon: <NotificationsIcon />,
    },
    { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
    { text: 'Profile', path: '/profile', icon: <PersonIcon /> },
  ]

  const DrawerContent = () => (
    <Box sx={{ width: 280 }} role="presentation">
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" fontWeight={700} color="primary">
          💸 Expense Tracker
        </Typography>
        <IconButton onClick={toggleDrawer} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      {isAuthed && user && (
        <>
          <Box
            sx={{
              p: 2,
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.dark' }}>
                {user.email?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user.email || 'User'}
                </Typography>
                <Typography variant="caption">Account Active</Typography>
              </Box>
            </Stack>
          </Box>
          <Divider />
        </>
      )}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => setDrawerOpen(false)}
              sx={{
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color:
                    location.pathname === item.path
                      ? 'primary.main'
                      : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleTheme}>
            <ListItemIcon>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </ListItemIcon>
            <ListItemText
              primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        {isAuthed ? (
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink}
                to="/login"
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink}
                to="/signup"
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemIcon>
                  <PersonAddIcon />
                </ListItemIcon>
                <ListItemText primary="Sign Up" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar
        position="sticky"
        elevation={2}
        sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700 }}
            >
              💸 Expense Tracker
            </Typography>
          </Stack>

          {!isMobile && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Link
                component={NavLink}
                to="/"
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  '&.active': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                Dashboard
              </Link>
              <Link
                component={NavLink}
                to="/expenses"
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  '&.active': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                Expenses
              </Link>
              <Link
                component={NavLink}
                to="/analytics"
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  '&.active': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                Analytics
              </Link>
              <Link
                component={NavLink}
                to="/financial"
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  '&.active': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                Financial
              </Link>
              <Link
                component={NavLink}
                to="/notifications"
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  '&.active': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                Notifications
              </Link>
              <Link
                component={NavLink}
                to="/settings"
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  '&.active': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                Settings
              </Link>
              <Link
                component={NavLink}
                to="/profile"
                sx={{
                  color: 'inherit',
                  textDecoration: 'none',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  '&.active': {
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                Profile
              </Link>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              {isAuthed ? (
                <Button
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    startIcon={<LoginIcon />}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/signup"
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                  >
                    Sign Up
                  </Button>
                </Stack>
              )}
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
        <DrawerContent />
      </Drawer>
    </>
  )
}
