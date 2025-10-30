import {
    Edit as EditIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Save as SaveIcon,
} from '@mui/icons-material'
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Grid,
    Snackbar,
    TextField,
    Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import { api } from '../context/AuthContext'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/api/auth/me')
      setUser(data.user)
      setName(data.user.name)
      setEmail(data.user.email)
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load profile',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!name.trim()) {
      setErrors({ name: 'Name is required' })
      return
    }

    if (!email.trim()) {
      setErrors({ email: 'Email is required' })
      return
    }

    try {
      const { data } = await api.put('/api/auth/profile', { name, email })
      setUser(data.user)
      setEditing(false)
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success',
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update profile',
        severity: 'error',
      })
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!currentPassword) {
      setErrors({ currentPassword: 'Current password is required' })
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters' })
      return
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    try {
      await api.put('/api/auth/password', { currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setChangingPassword(false)
      setSnackbar({
        open: true,
        message: 'Password changed successfully!',
        severity: 'success',
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to change password',
        severity: 'error',
      })
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
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
      <Typography variant="h4" gutterBottom fontWeight="bold">
        My Profile
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Profile Overview Card */}
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
              p: 3,
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto',
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                fontSize: '2.5rem',
                fontWeight: 'bold',
              }}
            >
              {user && getInitials(user.name)}
            </Avatar>
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
              {user?.name}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              {user?.email}
            </Typography>
            <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Member since{' '}
              {user &&
                new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
            </Typography>
          </Card>
        </Grid>

        {/* Profile Details and Edit */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" fontWeight="bold">
                  Profile Information
                </Typography>
                {!editing && (
                  <Button
                    startIcon={<EditIcon />}
                    variant="outlined"
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </Box>

              {editing ? (
                <Box component="form" onSubmit={handleUpdateProfile}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                      ),
                    }}
                  />
                  <Box display="flex" gap={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      fullWidth
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEditing(false)
                        setName(user.name)
                        setEmail(user.email)
                        setErrors({})
                      }}
                      fullWidth
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {user?.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card elevation={3} sx={{ mt: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" fontWeight="bold">
                  Change Password
                </Typography>
                {!changingPassword && (
                  <Button
                    startIcon={<LockIcon />}
                    variant="outlined"
                    color="secondary"
                    onClick={() => setChangingPassword(true)}
                  >
                    Change Password
                  </Button>
                )}
              </Box>

              {changingPassword ? (
                <Box component="form" onSubmit={handleChangePassword}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <LockIcon sx={{ mr: 1, color: 'action.active' }} />
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    error={!!errors.newPassword}
                    helperText={
                      errors.newPassword || 'Must be at least 6 characters'
                    }
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <LockIcon sx={{ mr: 1, color: 'action.active' }} />
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <LockIcon sx={{ mr: 1, color: 'action.active' }} />
                      ),
                    }}
                  />
                  <Box display="flex" gap={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      startIcon={<SaveIcon />}
                      fullWidth
                    >
                      Update Password
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setChangingPassword(false)
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                        setErrors({})
                      }}
                      fullWidth
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  Keep your account secure by regularly updating your password.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
