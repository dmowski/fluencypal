import { supportedLanguages } from "./lang";

export const parseLangFromUrl = (pathname: string) => {
  const potentialLang = pathname?.split("/")[1].trim();
  const supportedLang = supportedLanguages.find((l) => l === potentialLang) || "en";
  return supportedLang;
};
