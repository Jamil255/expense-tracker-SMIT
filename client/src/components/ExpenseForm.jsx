import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  Grid,
  TextField,
  Button,
  Autocomplete,
  InputAdornment,
  Box,
  Chip,
  Stack,
} from '@mui/material'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CategoryIcon from '@mui/icons-material/Category'
import EventIcon from '@mui/icons-material/Event'
import SaveIcon from '@mui/icons-material/Save'
import AddIcon from '@mui/icons-material/Add'

export default function ExpenseForm({ onSubmit, initial, suggestions = [] }) {
  const [amount, setAmount] = useState(initial?.amount ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [date, setDate] = useState(
    initial?.date
      ? format(new Date(initial.date), 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd')
  )
  const [touched, setTouched] = useState({})

  // Update form when initial values change (for edit mode)
  useEffect(() => {
    if (initial) {
      setAmount(initial.amount ?? '')
      setCategory(initial.category ?? '')
      setDate(
        initial.date
          ? format(new Date(initial.date), 'yyyy-MM-dd')
          : format(new Date(), 'yyyy-MM-dd')
      )
      setTouched({})
    } else {
      // Clear form when initial becomes null (after edit)
      setAmount('')
      setCategory('')
      setDate(format(new Date(), 'yyyy-MM-dd'))
      setTouched({})
    }
  }, [initial])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      amount: Number(amount),
      category,
      date: new Date(date),
    })

    // Reset form if adding new expense (not editing)
    if (!initial) {
      setAmount('')
      setCategory('')
      setDate(format(new Date(), 'yyyy-MM-dd'))
      setTouched({})
    }
  }

  const isAmountValid = amount && Number(amount) > 0
  const isCategoryValid = category && category.trim().length > 0

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        p: 2,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="Amount"
            type="number"
            inputProps={{ step: '0.01', min: '0' }}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => setTouched({ ...touched, amount: true })}
            error={touched.amount && !isAmountValid}
            helperText={
              touched.amount && !isAmountValid
                ? 'Amount must be greater than 0'
                : ''
            }
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon sx={{ color: 'white', opacity: 0.7 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: 'white' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            freeSolo
            options={suggestions}
            value={category}
            onInputChange={(_, v) => setCategory(v)}
            onBlur={() => setTouched({ ...touched, category: true })}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                required
                error={touched.category && !isCategoryValid}
                helperText={
                  touched.category && !isCategoryValid
                    ? 'Category is required'
                    : ''
                }
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon sx={{ color: 'white', opacity: 0.7 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': { borderColor: 'white' },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
                  '& .MuiSvgIcon-root': { color: 'white' },
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Chip label={option} size="small" color="primary" />
              </li>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EventIcon sx={{ color: 'white', opacity: 0.7 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.3)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                '&.Mui-focused fieldset': { borderColor: 'white' },
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
              '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
            }}
          />
        </Grid>
        <Grid item xs={12} md={1}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            startIcon={initial ? <SaveIcon /> : <AddIcon />}
            sx={{
              height: '56px',
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 700,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {initial ? 'Save' : 'Add'}
          </Button>
        </Grid>
      </Grid>

      {suggestions.length > 0 && !initial && (
        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" gap={1}>
          <Box
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              alignSelf: 'center',
            }}
          >
            Quick add:
          </Box>
          {suggestions.slice(0, 5).map((sug) => (
            <Chip
              key={sug}
              label={sug}
              size="small"
              onClick={() => setCategory(sug)}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  )
}
