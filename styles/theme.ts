"use client";

import { createTheme, alpha } from '@mui/material/styles';

// Nestle/Nesforce color palette
const themeColors = {
  primary: "#003399", // Nestle Blue
  secondary: "#666666", // Gray
  success: "#4CAF50", // Keep for status indicators
  warning: "#F57C00", // Orange
  error: "#BA1A1A", // Red
  info: "#666666", // Gray
  black: "#1A1A1A", // Near black
  white: "#FFFFFF", // White
  gray: "#666666", // Medium gray
  lightGray: "#F5F5F5", // Light gray for backgrounds
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: themeColors.primary,
      light: alpha(themeColors.primary, 0.1),
      dark: "#002266",
      contrastText: themeColors.white,
    },
    secondary: {
      main: themeColors.secondary,
      light: alpha(themeColors.secondary, 0.1),
      dark: "#4D4D4D",
      contrastText: themeColors.white,
    },
    success: {
      main: themeColors.success,
      light: alpha(themeColors.success, 0.1),
      dark: "#388E3C",
      contrastText: themeColors.white,
    },
    warning: {
      main: themeColors.warning,
      light: alpha(themeColors.warning, 0.1),
      dark: "#E65100",
      contrastText: themeColors.black,
    },
    error: {
      main: themeColors.error,
      light: alpha(themeColors.error, 0.1),
      dark: "#93000A",
      contrastText: themeColors.white,
    },
    info: {
      main: themeColors.gray,
      light: alpha(themeColors.gray, 0.1),
      dark: "#4D4D4D",
      contrastText: themeColors.white,
    },
    background: {
      default: themeColors.lightGray,
      paper: themeColors.white,
    },
    text: {
      primary: themeColors.black,
      secondary: themeColors.gray,
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 700, fontSize: "2.25rem" },
    h2: { fontWeight: 700, fontSize: "1.875rem" },
    h3: { fontWeight: 700, fontSize: "1.5rem" },
    h4: { fontWeight: 700, fontSize: "1.25rem" },
    h5: { fontWeight: 700, fontSize: "1rem" },
    h6: { fontWeight: 700, fontSize: "0.875rem" },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: alpha(themeColors.primary, 0.05),
          color: themeColors.primary,
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
  },
});
