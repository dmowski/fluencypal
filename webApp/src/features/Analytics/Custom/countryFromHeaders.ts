export const countryFromHeaders = (request: Request): string => {
  const raw =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-country-code') ||
    '';
  return raw.trim().toUpperCase().slice(0, 8);
};
