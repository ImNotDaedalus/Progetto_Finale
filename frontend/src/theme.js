import { alpha, createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      dark: '#115293',
      light: '#63a4ff',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#546e7a',
      dark: '#29434e',
      light: '#819ca9',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    success: {
      main: '#2f7d5d',
    },
    error: {
      main: '#bc3f4e',
    },
    warning: {
      main: '#c58226',
    },
    info: {
      main: '#2d79a7',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Aptos", "Segoe UI", sans-serif',
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 600,
    },
    button: {
      fontSize: '0.92rem',
      fontWeight: 700,
      textTransform: 'none',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
          border: `1px solid ${alpha('#000000', 0.08)}`,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 20,
          '&:last-child': {
            paddingBottom: 20,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          alignSelf: 'flex-start',
          borderRadius: 8,
          minWidth: 'auto',
          padding: '7px 14px',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiChip: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          paddingBlock: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          color: '#1f1f1f',
          borderRight: `1px solid ${alpha('#000000', 0.08)}`,
        },
      },
    },
  },
})
