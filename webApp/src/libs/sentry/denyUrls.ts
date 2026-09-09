/**
 * Stack-frame URLs that are browser extensions or injected scripts, not app code.
 * Used with Sentry `denyUrls`.
 */
export const sentryDenyUrls: Array<string | RegExp> = [
  /extensions\//i,
  /^chrome:\/\//i,
  /^chrome-extension:\/\//i,
  /^moz-extension:\/\//i,
  /^safari-web-extension:\/\//i,
  /^webkit-masked-url:\/\//i,
  // Chrome/Edge isolated-world injectors (DARK-LANG-HZ / DARK-LANG-J0)
  /^app:\/\/\/executors\//i,
];
