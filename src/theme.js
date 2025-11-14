"use client";
import { createTheme } from "@mui/material/styles";

// Dark "Red Velvet" palette inspired by deep crimson and burgundy tones
// Updated background colors to be lighter dark gray instead of pure black
const redVelvet = {
  primary: {
    main: "#8B0000", // dark red
    light: "#A10D10",
    dark: "#5C0000",
    contrastText: "#FAF5F5",
  },
  secondary: {
    main: "#B22222", // firebrick
    light: "#C53A3A",
    dark: "#7A1515",
    contrastText: "#FAF5F5",
  },
  error: { main: "#EF5350" },
  warning: { main: "#F57C00" },
  info: { main: "#90CAF9" },
  success: { main: "#66BB6A" },
  background: {
    default: "#121212", // lighter dark gray similar to TikTok dark mode
    paper: "#1E1E1E", // slightly lighter than before
  },
  divider: "#2D2D2D", // adjusted to match new background
  text: {
    primary: "#F8EDED",
    secondary: "#E6C9C9",
    disabled: "#BFA3A3",
  },
};

export const theme = createTheme({
  cssVariables: true,
  palette: { mode: "dark", ...redVelvet },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiAppBar: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiButton: {
      defaultProps: { disableElevation: true, variant: "contained" },
      styleOverrides: {
        root: { borderRadius: 10 },
        containedPrimary: {
          background: "linear-gradient(135deg, #8B0000, #B22222)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #2D2D2D", // updated to match new theme
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#2D2D2D", // updated to match new theme
          color: redVelvet.text?.secondary || "#E6C9C9",
          borderColor: "#3D3D3D", // updated to match new theme
        },
      },
    },
  },
});

export default theme;



