import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from '@mui/material'

export default function Signup() {
  const { signup, loading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    const res = await signup(name, email, password)
    if (res.ok) navigate('/')
    else setError(res.message)
  }

  return (
    <Container maxWidth="sm">
      <Box
        minHeight="80vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={{ xs: 2, sm: 0 }}
      >
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, width: '100%' }}>
          <Typography variant="h4" mb={3} fontWeight={700} textAlign="center">
            Create Account
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={onSubmit}
            sx={{ display: 'grid', gap: 2 }}
          >
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              size="large"
              sx={{ mt: 1 }}
            >
              {loading ? 'Loading...' : 'Create Account'}
            </Button>
          </Box>
          <Typography variant="body2" mt={3} textAlign="center">
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Log in
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}
