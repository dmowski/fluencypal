export type Theme = "light" | "dark-red" | "dark-blue" | "gray";

export interface ColorScheme {
  sectionBgColor: string;
  textColor: string;
}

export const themeMap: Record<Theme, ColorScheme> = {
  light: {
    sectionBgColor: "#F0EFEB",
    textColor: "#000000",
  },
  "dark-red": {
    sectionBgColor: "rgba(20, 0, 0, 0.2)",
    textColor: "#FFFFFF",
  },
  "dark-blue": {
    sectionBgColor: "rgba(10, 18, 30, 1)",
    textColor: "#FFFFFF",
  },
  gray: {
    sectionBgColor: "#11131a",
    textColor: "#fff",
  },
};
