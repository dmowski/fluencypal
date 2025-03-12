export const getUrlStart = (lang: string) => {
  if (lang === "en") {
    return "/";
  } else {
    return `/${lang}/`;
  }
};
