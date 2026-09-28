import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '../features/uiKit/theme';
import { initLingui } from '@/initLingui';
import { LinguiClientProvider } from '@/features/Lang/LinguiClientProvider';
import { allMessages } from '@/appRouterI18n';
import { UrlStateProvider } from '@/features/Url/UrlStateContext';
import { globalInlineCss } from './globalInlineCss';
import { CustomAnalyticsHost } from '@/features/Analytics/Custom/CustomAnalyticsHost';
import { GoogleAdsHost } from '@/features/Analytics/GoogleAds/GoogleAdsHost';
import { CookieBanner } from '@/features/Legal/CookieBanner';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supportedLang = 'en';
  initLingui(supportedLang);

  return (
    <>
      <style
        href="app-global-inline-css"
        precedence="default"
        dangerouslySetInnerHTML={{ __html: globalInlineCss }}
      />
      <ThemeProvider theme={darkTheme}>
        <AppRouterCacheProvider options={{ key: 'css' }}>
          <LinguiClientProvider
            initialLocale={supportedLang}
            initialMessages={allMessages[supportedLang]!}
          >
            <UrlStateProvider>
              {children}
              <CookieBanner />
              <GoogleAdsHost />
              <CustomAnalyticsHost />
            </UrlStateProvider>
          </LinguiClientProvider>
        </AppRouterCacheProvider>
      </ThemeProvider>
    </>
  );
}
