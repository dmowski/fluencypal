export const getUrlStart = (lang: string) => {
  if (lang === 'en') {
    return '/';
  } else {
    return `/${lang}/`;
  }
};

export const getUrlStartWithoutLastSlash = (lang: string) => {
  if (lang === 'en') {
    return '/';
  } else {
    return `/${lang}`;
  }
};

export const getAppUrlStart = (lang: string) => {
  const url = 'https://app.fluencypal.com';
  const urlPart = getUrlStart(lang);
  return `${url}${urlPart}`;
};

export const getLandingUrlStart = (lang: string) => {
  const url = 'https://www.fluencypal.com';
  const urlPart = getUrlStart(lang);
  return `${url}${urlPart}`;
};
