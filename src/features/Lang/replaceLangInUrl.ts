import { getUrlStart } from "./getUrlStart";
import { SupportedLanguage, supportedLanguages } from "./lang";

export const replaceUrlToLang = (lang: string, urlPath: string) => {
  const newStartPath = getUrlStart(lang);

  const pathWithoutFirstSlash = urlPath.replace(/^\//, "");
  const pathParts = pathWithoutFirstSlash.split("/");

  const filteredParts = pathParts.filter((part, index) => {
    if (index === 0) {
      const isLang = supportedLanguages.includes(part as SupportedLanguage);

      if (isLang) {
        return false;
      }
    }

    return true;
  });

  const finalUrl = `${newStartPath}${filteredParts.join("/")}`;
  return finalUrl;
};
