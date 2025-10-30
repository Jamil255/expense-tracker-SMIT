import { useState } from 'react'
import { format } from 'date-fns'
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  Paper,
  Chip,
  TableContainer,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Typography,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

export default function ExpenseTable({ items, onEdit, onDelete }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null })
  const total = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)

  const handleDeleteClick = (item) => {
    setDeleteDialog({ open: true, item })
  }

  const handleDeleteConfirm = () => {
    if (deleteDialog.item) {
      onDelete(deleteDialog.item)
    }
    setDeleteDialog({ open: false, item: null })
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, item: null })
  }

  const handleEditClick = (item) => {
    onEdit(item)
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getCategoryColor = (category) => {
    const colors = {
      food: 'success',
      transport: 'info',
      shopping: 'warning',
      entertainment: 'secondary',
      utilities: 'error',
      health: 'primary',
    }
    return colors[category?.toLowerCase()] || 'default'
  }

  if (isMobile) {
    // Mobile card view
    return (
      <>
        <Stack spacing={2}>
          {items.map((item) => (
            <Paper
              key={item._id}
              elevation={2}
              sx={{
                p: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="primary">
                      ${Number(item.amount).toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(item.date), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={item.category}
                    color={getCategoryColor(item.category)}
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditClick(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(item)}
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}

          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              border: `2px solid ${theme.palette.primary.main}`,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary">
                ${total.toFixed(2)}
              </Typography>
            </Stack>
          </Paper>
        </Stack>

        <Dialog
          open={deleteDialog.open}
          onClose={handleDeleteCancel}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this expense?
              {deleteDialog.item && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Amount:</strong> $
                    {Number(deleteDialog.item.amount).toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Category:</strong> {deleteDialog.item.category}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong>{' '}
                    {format(new Date(deleteDialog.item.date), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
    )
  }

  // Desktop table view
  return (
    <>
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>
                Date
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>
                Category
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700 }}>
                Amount
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: 'white', fontWeight: 700 }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((e) => (
              <TableRow
                key={e._id}
                hover
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    transform: 'scale(1.01)',
                  },
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>
                  {format(new Date(e.date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={e.category}
                    color={getCategoryColor(e.category)}
                    sx={{
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700} color="primary">
                    ${Number(e.amount).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Edit expense">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditClick(e)}
                        sx={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'rotate(15deg) scale(1.1)',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete expense">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(e)}
                        sx={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.2)',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: '1rem' }}>
                Total ({items.length} {items.length === 1 ? 'item' : 'items'})
              </TableCell>
              <TableCell align="right">
                <Typography variant="h6" fontWeight={700} color="primary">
                  ${total.toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'white' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>
            Are you sure you want to delete this expense? This action cannot be
            undone.
          </DialogContentText>
          {deleteDialog.item && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                borderLeft: `4px solid ${theme.palette.error.main}`,
              }}
            >
              <Typography variant="body2" gutterBottom>
                <strong>Amount:</strong> $
                {Number(deleteDialog.item.amount).toFixed(2)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Category:</strong> {deleteDialog.item.category}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Date:</strong>{' '}
                {format(new Date(deleteDialog.item.date), 'MMM dd, yyyy')}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleDeleteCancel} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
