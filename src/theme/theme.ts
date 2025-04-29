import { PaletteMode } from '@mui/material';
import { alpha, createTheme, ThemeOptions } from '@mui/material/styles';

// Define the color palette for both light and dark modes
export const getDesignTokens = (mode: PaletteMode): ThemeOptions => {
  // Common palette values
  const primaryMain = mode === 'light' ? '#6a82fb' : '#8c9eff';
  const secondaryMain = mode === 'light' ? '#fc5c7d' : '#ff8a9d';

  return {
    palette: {
      mode,
      primary: {
        main: primaryMain,
        light: mode === 'light' ? '#8c9eff' : '#a5b4ff',
        dark: mode === 'light' ? '#5a72eb' : '#7c8eef',
        contrastText: '#ffffff',
      },
      secondary: {
        main: secondaryMain,
        light: mode === 'light' ? '#ff8a9d' : '#ffadc0',
        dark: mode === 'light' ? '#e64c6d' : '#f5798d',
        contrastText: '#ffffff',
      },
      success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20',
      },
      error: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#c62828',
      },
      warning: {
        main: '#ed6c02',
        light: '#ff9800',
        dark: '#e65100',
      },
      info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b',
      },
      background: {
        default: mode === 'light' ? '#f8f9ff' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#212121' : '#ffffff',
        secondary: mode === 'light' ? '#5f6368' : '#b0b0b0',
        disabled: mode === 'light' ? '#9e9e9e' : '#6c6c6c',
      },
      divider: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 700,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
      subtitle1: {
        fontWeight: 500,
      },
      subtitle2: {
        fontWeight: 500,
      },
      body1: {
        fontWeight: 400,
      },
      body2: {
        fontWeight: 400,
      },
      button: {
        fontWeight: 500,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            transition: 'background-color 0.3s, color 0.3s',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'light' ? '#f1f1f1' : '#2d2d2d',
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'light' ? '#c1c1c1' : '#555',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: mode === 'light' ? '#a1a1a1' : '#666',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            boxShadow: mode === 'light' 
              ? '0 4px 12px rgba(106, 130, 251, 0.2)' 
              : '0 4px 12px rgba(140, 158, 255, 0.1)',
            '&:hover': {
              boxShadow: mode === 'light' 
                ? '0 6px 16px rgba(106, 130, 251, 0.3)' 
                : '0 6px 16px rgba(140, 158, 255, 0.2)',
            },
          },
          outlined: {
            borderWidth: 1.5,
            '&:hover': {
              borderWidth: 1.5,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            transition: 'background-color 0.3s, box-shadow 0.3s',
          },
          elevation1: {
            boxShadow: mode === 'light' 
              ? '0 2px 12px rgba(0, 0, 0, 0.08)' 
              : '0 2px 12px rgba(0, 0, 0, 0.2)',
          },
          elevation2: {
            boxShadow: mode === 'light' 
              ? '0 4px 16px rgba(0, 0, 0, 0.08)' 
              : '0 4px 16px rgba(0, 0, 0, 0.3)',
          },
          elevation3: {
            boxShadow: mode === 'light' 
              ? '0 6px 20px rgba(0, 0, 0, 0.1)' 
              : '0 6px 20px rgba(0, 0, 0, 0.4)',
          },
          elevation4: {
            boxShadow: mode === 'light' 
              ? '0 8px 24px rgba(0, 0, 0, 0.12)' 
              : '0 8px 24px rgba(0, 0, 0, 0.5)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: mode === 'light' 
                ? '0 12px 24px rgba(106, 130, 251, 0.15)' 
                : '0 12px 24px rgba(0, 0, 0, 0.4)',
            },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: 24,
            '&:last-child': {
              paddingBottom: 24,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '16px',
            borderBottom: mode === 'light' 
              ? '1px solid rgba(0, 0, 0, 0.08)' 
              : '1px solid rgba(255, 255, 255, 0.08)',
          },
          head: {
            fontWeight: 600,
            backgroundColor: mode === 'light' 
              ? alpha(primaryMain, 0.04) 
              : alpha(primaryMain, 0.15),
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td': {
              borderBottom: 0,
            },
            '&:hover': {
              backgroundColor: mode === 'light' 
                ? alpha(primaryMain, 0.04) 
                : alpha(primaryMain, 0.08),
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            transition: 'all 0.2s',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontWeight: 600,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            alignItems: 'center',
          },
          standardSuccess: {
            backgroundColor: mode === 'light' 
              ? alpha('#2e7d32', 0.1) 
              : alpha('#4caf50', 0.15),
            color: mode === 'light' ? '#2e7d32' : '#81c784',
          },
          standardError: {
            backgroundColor: mode === 'light' 
              ? alpha('#d32f2f', 0.1) 
              : alpha('#f44336', 0.15),
            color: mode === 'light' ? '#d32f2f' : '#e57373',
          },
          standardWarning: {
            backgroundColor: mode === 'light' 
              ? alpha('#ed6c02', 0.1) 
              : alpha('#ff9800', 0.15),
            color: mode === 'light' ? '#ed6c02' : '#ffb74d',
          },
          standardInfo: {
            backgroundColor: mode === 'light' 
              ? alpha('#0288d1', 0.1) 
              : alpha('#03a9f4', 0.15),
            color: mode === 'light' ? '#0288d1' : '#4fc3f7',
          },
          filledSuccess: {
            fontWeight: 500,
          },
          filledError: {
            fontWeight: 500,
          },
          filledWarning: {
            fontWeight: 500,
          },
          filledInfo: {
            fontWeight: 500,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              transition: 'all 0.2s',
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
                borderColor: primaryMain,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'light' 
                  ? 'rgba(0, 0, 0, 0.23)' 
                  : 'rgba(255, 255, 255, 0.23)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'light' 
                  ? 'rgba(0, 0, 0, 0.5)' 
                  : 'rgba(255, 255, 255, 0.5)',
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: mode === 'light' 
              ? '0 8px 32px rgba(0, 0, 0, 0.12)' 
              : '0 8px 32px rgba(0, 0, 0, 0.5)',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: mode === 'light' 
              ? 'rgba(0, 0, 0, 0.08)' 
              : 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: mode === 'light'
              ? 'linear-gradient(180deg, rgba(106, 130, 251, 0.05) 0%, rgba(252, 92, 125, 0.05) 100%)'
              : 'linear-gradient(180deg, rgba(140, 158, 255, 0.05) 0%, rgba(255, 138, 157, 0.05) 100%)',
            borderRight: mode === 'light'
              ? '1px solid rgba(0, 0, 0, 0.08)'
              : '1px solid rgba(255, 255, 255, 0.08)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            transition: 'all 0.2s',
            '&.Mui-selected': {
              backgroundColor: mode === 'light'
                ? alpha(primaryMain, 0.12)
                : alpha(primaryMain, 0.24),
              color: primaryMain,
              '&:hover': {
                backgroundColor: mode === 'light'
                  ? alpha(primaryMain, 0.18)
                  : alpha(primaryMain, 0.32),
              },
            },
            '&:hover': {
              backgroundColor: mode === 'light'
                ? alpha(primaryMain, 0.08)
                : alpha(primaryMain, 0.16),
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light'
              ? '0 2px 12px rgba(106, 130, 251, 0.12)'
              : '0 2px 12px rgba(0, 0, 0, 0.3)',
            backgroundImage: mode === 'light'
              ? 'linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)'
              : 'linear-gradient(90deg, #8c9eff 0%, #ff8a9d 100%)',
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontWeight: 500,
            },
          },
        },
      },
    },
  };
};

// Create a default theme (this will be replaced by the ThemeProvider)
const theme = createTheme(getDesignTokens('light'));

export default theme;