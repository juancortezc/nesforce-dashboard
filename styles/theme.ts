import { createTheme } from '@mui/material/styles';

// Material Design 3 Theme con colores vibrantes
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4', // MD3 Primary
      light: '#7E6DB3',
      dark: '#4E378B',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#625B71', // MD3 Secondary
      light: '#7E75A9',
      dark: '#4A4458',
      contrastText: '#FFFFFF',
    },
    tertiary: {
      main: '#7D5260', // MD3 Tertiary
      light: '#9A6B7A',
      dark: '#633B4A',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#BA1A1A', // MD3 Error
      light: '#FF5449',
      dark: '#93000A',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    warning: {
      main: '#F57C00',
      light: '#FF9800',
      dark: '#E65100',
    },
    info: {
      main: '#0288D1',
      light: '#03A9F4',
      dark: '#01579B',
    },
    background: {
      default: '#FEF7FF', // MD3 Surface tint
      paper: '#FFFFFF',
    },
    divider: '#E8DEF8',
  },
  typography: {
    fontFamily: '"Roboto", "Inter", "Segoe UI", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12, // MD3 uses more rounded corners
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(103, 80, 164, 0.12), 0px 1px 2px rgba(103, 80, 164, 0.08)',
    '0px 3px 6px rgba(103, 80, 164, 0.16), 0px 3px 6px rgba(103, 80, 164, 0.10)',
    '0px 6px 12px rgba(103, 80, 164, 0.18), 0px 3px 6px rgba(103, 80, 164, 0.12)',
    '0px 10px 20px rgba(103, 80, 164, 0.20), 0px 6px 6px rgba(103, 80, 164, 0.14)',
    '0px 14px 28px rgba(103, 80, 164, 0.22), 0px 10px 10px rgba(103, 80, 164, 0.16)',
    '0px 19px 38px rgba(103, 80, 164, 0.24), 0px 15px 12px rgba(103, 80, 164, 0.18)',
    '0px 24px 48px rgba(103, 80, 164, 0.26), 0px 19px 16px rgba(103, 80, 164, 0.20)',
    '0px 32px 64px rgba(103, 80, 164, 0.28), 0px 24px 20px rgba(103, 80, 164, 0.22)',
    '0px 40px 80px rgba(103, 80, 164, 0.30), 0px 30px 24px rgba(103, 80, 164, 0.24)',
    '0px 48px 96px rgba(103, 80, 164, 0.32), 0px 36px 28px rgba(103, 80, 164, 0.26)',
    '0px 56px 112px rgba(103, 80, 164, 0.34), 0px 42px 32px rgba(103, 80, 164, 0.28)',
    '0px 64px 128px rgba(103, 80, 164, 0.36), 0px 48px 36px rgba(103, 80, 164, 0.30)',
    '0px 72px 144px rgba(103, 80, 164, 0.38), 0px 54px 40px rgba(103, 80, 164, 0.32)',
    '0px 80px 160px rgba(103, 80, 164, 0.40), 0px 60px 44px rgba(103, 80, 164, 0.34)',
    '0px 88px 176px rgba(103, 80, 164, 0.42), 0px 66px 48px rgba(103, 80, 164, 0.36)',
    '0px 96px 192px rgba(103, 80, 164, 0.44), 0px 72px 52px rgba(103, 80, 164, 0.38)',
    '0px 104px 208px rgba(103, 80, 164, 0.46), 0px 78px 56px rgba(103, 80, 164, 0.40)',
    '0px 112px 224px rgba(103, 80, 164, 0.48), 0px 84px 60px rgba(103, 80, 164, 0.42)',
    '0px 120px 240px rgba(103, 80, 164, 0.50), 0px 90px 64px rgba(103, 80, 164, 0.44)',
    '0px 128px 256px rgba(103, 80, 164, 0.52), 0px 96px 68px rgba(103, 80, 164, 0.46)',
    '0px 136px 272px rgba(103, 80, 164, 0.54), 0px 102px 72px rgba(103, 80, 164, 0.48)',
    '0px 144px 288px rgba(103, 80, 164, 0.56), 0px 108px 76px rgba(103, 80, 164, 0.50)',
    '0px 152px 304px rgba(103, 80, 164, 0.58), 0px 114px 80px rgba(103, 80, 164, 0.52)',
    '0px 160px 320px rgba(103, 80, 164, 0.60), 0px 120px 84px rgba(103, 80, 164, 0.54)',
  ],
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(103, 80, 164, 0.12), 0px 1px 2px rgba(103, 80, 164, 0.08)',
        },
        elevation2: {
          boxShadow: '0px 3px 6px rgba(103, 80, 164, 0.16), 0px 3px 6px rgba(103, 80, 164, 0.10)',
        },
        elevation3: {
          boxShadow: '0px 6px 12px rgba(103, 80, 164, 0.18), 0px 3px 6px rgba(103, 80, 164, 0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 10px 20px rgba(103, 80, 164, 0.20), 0px 6px 6px rgba(103, 80, 164, 0.14)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 3px 6px rgba(103, 80, 164, 0.16)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #6750A4 0%, #7E6DB3 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4E378B 0%, #6750A4 100%)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: '#F5F0FA',
          color: '#4E378B',
        },
      },
    },
  },
});

// Utility functions for gradients
export const gradients = {
  primary: 'linear-gradient(135deg, #6750A4 0%, #7E6DB3 50%, #9A8FC8 100%)',
  secondary: 'linear-gradient(135deg, #625B71 0%, #7E75A9 100%)',
  success: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
  error: 'linear-gradient(135deg, #BA1A1A 0%, #FF5449 100%)',
  warning: 'linear-gradient(135deg, #F57C00 0%, #FF9800 100%)',
  info: 'linear-gradient(135deg, #0288D1 0%, #03A9F4 100%)',
  surface: 'linear-gradient(180deg, #FFFFFF 0%, #FEF7FF 100%)',
  glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(254, 247, 255, 0.7) 100%)',
};

// Card styles with gradients
export const cardStyles = {
  primary: {
    background: gradients.primary,
    color: '#FFFFFF',
    '& .MuiTypography-root': {
      color: '#FFFFFF',
    },
  },
  glass: {
    background: gradients.glass,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(103, 80, 164, 0.1)',
  },
  elevated: {
    background: '#FFFFFF',
    boxShadow: '0px 10px 20px rgba(103, 80, 164, 0.15)',
  },
};
