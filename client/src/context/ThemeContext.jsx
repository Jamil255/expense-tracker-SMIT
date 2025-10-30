import { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material'

const ThemeContext = createContext()

export const useThemeMode = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode')
    return savedMode || 'light'
  })

  useEffect(() => {
    localStorage.setItem('themeMode', mode)
  }, [mode])

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
  }

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode colors
                primary: {
                  main: '#1976d2',
                  light: '#e3f2fd',
                  dark: '#1565c0',
                },
                secondary: {
                  main: '#dc004e',
                },
                success: {
                  main: '#43a047',
                  light: '#e8f5e9',
                  lighter: '#f1f8f4',
                },
                warning: {
                  main: '#ff9800',
                  light: '#fff3e0',
                  lighter: '#fff8f0',
                },
                error: {
                  main: '#d32f2f',
                  light: '#ffebee',
                },
                background: {
                  default: '#fafafa',
                  paper: '#ffffff',
                },
                grey: {
                  50: '#fafafa',
                  100: '#f5f5f5',
                  200: '#eeeeee',
                },
              }
            : {
                // Dark mode colors
                primary: {
                  main: '#90caf9',
                  light: '#1e3a5f',
                  dark: '#42a5f5',
                },
                secondary: {
                  main: '#f48fb1',
                },
                success: {
                  main: '#66bb6a',
                  light: '#1b3a1e',
                  lighter: '#1a2e1c',
                },
                warning: {
                  main: '#ffa726',
                  light: '#3d2f1f',
                  lighter: '#332816',
                },
                error: {
                  main: '#f44336',
                  light: '#3d1f1f',
                },
                background: {
                  default: '#121212',
                  paper: '#1e1e1e',
                },
                grey: {
                  50: '#2c2c2c',
                  100: '#383838',
                  200: '#424242',
                },
              }),
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode]
  )

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
