"use client";
import { createTheme } from "@mui/material/styles";
import { customButton } from "./Button/style";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    //primary.main: "#258adc",
  },
  typography: {
    fontFamily: "var(--font-roboto)",
  },
  components: {
    MuiButton: customButton,
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
