import { Box, Container, Typography, Stack, Link, Divider } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import GitHubIcon from '@mui/icons-material/GitHub'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import TwitterIcon from '@mui/icons-material/Twitter'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'center', sm: 'flex-start' }}
            spacing={3}
          >
            {/* Brand Section */}
            <Box textAlign={{ xs: 'center', sm: 'left' }}>
              <Typography
                variant="h6"
                fontWeight={700}
                color="white"
                gutterBottom
              >
                💸 Expense Tracker
              </Typography>
              <Typography
                variant="body2"
                color="rgba(255, 255, 255, 0.8)"
                maxWidth={300}
              >
                Track your expenses, manage your budget, and achieve your
                financial goals.
              </Typography>
            </Box>

            {/* Links Section */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 4 }}
              textAlign={{ xs: 'center', sm: 'left' }}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  gutterBottom
                  color="white"
                >
                  Quick Links
                </Typography>
                <Stack spacing={0.5}>
                  <Link
                    href="/"
                    color="rgba(255, 255, 255, 0.8)"
                    underline="hover"
                    sx={{ '&:hover': { color: 'white' } }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/expenses"
                    color="rgba(255, 255, 255, 0.8)"
                    underline="hover"
                    sx={{ '&:hover': { color: 'white' } }}
                  >
                    Expenses
                  </Link>
                  <Link
                    href="/profile"
                    color="rgba(255, 255, 255, 0.8)"
                    underline="hover"
                    sx={{ '&:hover': { color: 'white' } }}
                  >
                    Profile
                  </Link>
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  gutterBottom
                  color="white"
                >
                  Resources
                </Typography>
                <Stack spacing={0.5}>
                  <Link
                    href="#"
                    color="rgba(255, 255, 255, 0.8)"
                    underline="hover"
                    sx={{ '&:hover': { color: 'white' } }}
                  >
                    Help Center
                  </Link>
                  <Link
                    href="#"
                    color="rgba(255, 255, 255, 0.8)"
                    underline="hover"
                    sx={{ '&:hover': { color: 'white' } }}
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="#"
                    color="rgba(255, 255, 255, 0.8)"
                    underline="hover"
                    sx={{ '&:hover': { color: 'white' } }}
                  >
                    Terms of Service
                  </Link>
                </Stack>
              </Box>
            </Stack>

            {/* Social Media */}
            <Box textAlign={{ xs: 'center', sm: 'left' }}>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                color="white"
              >
                Connect With Us
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
              >
                <Link
                  href="https://github.com/Jamil255"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="rgba(255, 255, 255, 0.8)"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': { color: 'white' },
                  }}
                >
                  <GitHubIcon />
                </Link>
                <Link
                  href="https://linkedin.com/in/jamil255"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="rgba(255, 255, 255, 0.8)"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': { color: 'white' },
                  }}
                >
                  <LinkedInIcon />
                </Link>
                <Link
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="rgba(255, 255, 255, 0.8)"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': { color: 'white' },
                  }}
                >
                  <TwitterIcon />
                </Link>
              </Stack>
            </Box>
          </Stack>

          <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

          {/* Copyright */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Typography
              variant="body2"
              color="rgba(255, 255, 255, 0.8)"
              textAlign="center"
            >
              © {currentYear} Expense Tracker. All rights reserved.
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                Made with
              </Typography>
              <FavoriteIcon sx={{ fontSize: 16, color: '#ff4757' }} />
              <Typography variant="body2" color="rgba(255, 255, 255, 0.8)">
                Visionary Coders
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
