const BOT_PATTERN =
  /bot|crawler|spider|crawling|preview|headless|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|whatsapp|telegram|discord|slackbot|twitterbot|linkedinbot|pinterest|vkshare|skypeuripreview|nuzzel|outbrain|yahoo|duckduckbot|baiduspider|yandex|sogou|exabot|facebot|ia_archiver|semrush|ahrefs|mj12|dotbot|petalbot|bytespider|gptbot|claudebot|anthropic|ccbot|google-extended|amazonbot|applebot|pingdom|uptimerobot|statuscake|lighthouse|pagespeed|gtmetrix|chrome-lighthouse|phantomjs|selenium|webdriver|playwright|puppeteer|cypress|monitor|checker|fetch|wget|curl|python-requests|go-http-client|java\/|libwww|httpclient|okhttp|scrapy|axios\//i;

export const isBotUserAgent = (userAgent: string): boolean => {
  const ua = userAgent.trim();
  if (!ua) return true;
  return BOT_PATTERN.test(ua);
};

export const isBotBrowser = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  if (navigator.webdriver) return true;
  return isBotUserAgent(navigator.userAgent || '');
};
