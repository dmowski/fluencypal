"use client";
import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: "var(--font-roboto)",
  },
  //cssVariables: true,
});

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
  typography: {
    fontFamily: "var(--font-roboto)",
  },
  //cssVariables: true,
});

export { darkTheme, lightTheme };
