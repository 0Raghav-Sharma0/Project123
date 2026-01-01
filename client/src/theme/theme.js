import { createTheme } from '@mui/material/styles'

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0ea5e9',
      light: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    divider: '#e2e8f0',
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.015em',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    subtitle2: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.8125rem',
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.6875rem',
      lineHeight: 1.4,
    },
    overline: {
      fontSize: '0.625rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ...Array(18).fill('none'), // Minimal shadows for higher elevations
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: "'ss01' on, 'ss02' on, 'cv01' on, 'cv02' on",
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.8125rem',
          padding: '8px 16px',
          minHeight: 36,
          transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'none',
          },
          '&:active': {
            transform: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#3b82f6',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#2563eb',
            boxShadow: 'none',
          },
        },
        containedSecondary: {
          backgroundColor: '#8b5cf6',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#7c3aed',
            boxShadow: 'none',
          },
        },
        outlined: {
          border: '1px solid',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.04)',
          },
        },
        outlinedPrimary: {
          borderColor: '#3b82f6',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.04)',
            borderColor: '#2563eb',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.04)',
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.75rem',
          minHeight: 32,
        },
        sizeLarge: {
          padding: '10px 20px',
          fontSize: '0.875rem',
          minHeight: 40,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        },
        outlined: {
          border: '1px solid #e2e8f0',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          transition: 'border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: '#cbd5e1',
            boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
            transform: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#94a3b8',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3b82f6',
              borderWidth: 1,
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            '&.Mui-focused': {
              color: '#3b82f6',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          color: '#0f172a',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          padding: '8px 12px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
          height: 24,
        },
        colorPrimary: {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#3b82f6',
        },
        colorSecondary: {
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          color: '#8b5cf6',
        },
        colorSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          borderColor: 'rgba(16, 185, 129, 0.2)',
        },
        standardInfo: {
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          color: '#0ea5e9',
          borderColor: 'rgba(14, 165, 233, 0.2)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: '#e2e8f0',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderRadius: 6,
          margin: '2px 8px',
          padding: '8px 12px',
          minHeight: 36,
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
            },
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          overflow: 'hidden',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8fafc',
          '& .MuiTableCell-head': {
            fontWeight: 500,
            color: '#64748b',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 16px',
          fontSize: '0.875rem',
        },
        head: {
          backgroundColor: '#f8fafc',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
        },
      },
    },
  },
})

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#7c3aed',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0ea5e9',
      light: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
      disabled: '#64748b',
    },
    divider: '#334155',
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    ...lightTheme.typography,
    h1: {
      ...lightTheme.typography.h1,
      color: '#f1f5f9',
    },
    h2: {
      ...lightTheme.typography.h2,
      color: '#f1f5f9',
    },
    h3: {
      ...lightTheme.typography.h3,
      color: '#f1f5f9',
    },
    h4: {
      ...lightTheme.typography.h4,
      color: '#f1f5f9',
    },
    h5: {
      ...lightTheme.typography.h5,
      color: '#f1f5f9',
    },
    h6: {
      ...lightTheme.typography.h6,
      color: '#f1f5f9',
    },
    body1: {
      ...lightTheme.typography.body1,
      color: '#e2e8f0',
    },
    body2: {
      ...lightTheme.typography.body2,
      color: '#94a3b8',
    },
    subtitle1: {
      ...lightTheme.typography.subtitle1,
      color: '#94a3b8',
    },
    subtitle2: {
      ...lightTheme.typography.subtitle2,
      color: '#64748b',
    },
    caption: {
      ...lightTheme.typography.caption,
      color: '#64748b',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.2)',
    '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 2px rgba(0, 0, 0, 0.24)',
    '0px 4px 6px -1px rgba(0, 0, 0, 0.3), 0px 2px 4px -1px rgba(0, 0, 0, 0.24)',
    '0px 10px 15px -3px rgba(0, 0, 0, 0.3), 0px 4px 6px -2px rgba(0, 0, 0, 0.2)',
    '0px 20px 25px -5px rgba(0, 0, 0, 0.3), 0px 10px 10px -5px rgba(0, 0, 0, 0.16)',
    '0px 25px 50px -12px rgba(0, 0, 0, 0.5)',
    ...Array(18).fill('none'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFeatureSettings: "'ss01' on, 'ss02' on, 'cv01' on, 'cv02' on",
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          backgroundColor: '#0f172a',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.8125rem',
          padding: '8px 16px',
          minHeight: 36,
          transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'none',
          },
          '&:active': {
            transform: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#3b82f6',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#2563eb',
            boxShadow: 'none',
          },
        },
        containedSecondary: {
          backgroundColor: '#8b5cf6',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#7c3aed',
            boxShadow: 'none',
          },
        },
        outlined: {
          border: '1px solid #475569',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            borderColor: '#64748b',
          },
        },
        outlinedPrimary: {
          borderColor: '#3b82f6',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            borderColor: '#60a5fa',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.75rem',
          minHeight: 32,
        },
        sizeLarge: {
          padding: '10px 20px',
          fontSize: '0.875rem',
          minHeight: 40,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1e293b',
          borderRadius: 12,
          border: '1px solid #334155',
        },
        outlined: {
          border: '1px solid #334155',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 2px rgba(0, 0, 0, 0.24)',
        },
        elevation2: {
          boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.3), 0px 2px 4px -1px rgba(0, 0, 0, 0.24)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          borderRadius: 12,
          border: '1px solid #334155',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 2px rgba(0, 0, 0, 0.24)',
          transition: 'border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: '#475569',
            boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.3), 0px 2px 4px -1px rgba(0, 0, 0, 0.24)',
            transform: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#1e293b',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#475569',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3b82f6',
              borderWidth: 1,
            },
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.875rem',
            color: '#94a3b8',
            '&.Mui-focused': {
              color: '#3b82f6',
            },
          },
          '& .MuiInputBase-input': {
            color: '#f1f5f9',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #334155',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 2px rgba(0, 0, 0, 0.24)',
          color: '#f1f5f9',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0f172a',
          borderRight: '1px solid #334155',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          padding: '8px 12px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.16)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: '0.75rem',
          height: 24,
        },
        colorPrimary: {
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          color: '#60a5fa',
        },
        colorSecondary: {
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          color: '#a78bfa',
        },
        colorSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          color: '#34d399',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.875rem',
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#34d399',
          borderColor: 'rgba(16, 185, 129, 0.2)',
        },
        standardInfo: {
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          color: '#38bdf8',
          borderColor: 'rgba(14, 165, 233, 0.2)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: '#334155',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e293b',
          borderRadius: 8,
          border: '1px solid #334155',
          boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.3), 0px 4px 6px -2px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderRadius: 6,
          margin: '2px 8px',
          padding: '8px 12px',
          minHeight: 36,
          color: '#e2e8f0',
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.16)',
            },
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          overflow: 'hidden',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          '& .MuiTableCell-head': {
            fontWeight: 500,
            color: '#94a3b8',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #334155',
          padding: '12px 16px',
          fontSize: '0.875rem',
          color: '#e2e8f0',
        },
        head: {
          backgroundColor: '#1e293b',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: '#f1f5f9',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: '#94a3b8',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        },
        bar: {
          borderRadius: 4,
          backgroundColor: '#3b82f6',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#3b82f6',
        },
      },
    },
  },
})

export const theme = (mode) => mode === 'dark' ? darkTheme : lightTheme
export { createTheme }