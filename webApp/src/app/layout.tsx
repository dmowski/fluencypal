import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '../features/uiKit/theme';
import { WindowSizesProvider } from '@/features/Layout/useWindowSizes';
import { initLingui } from '@/initLingui';
import { LinguiClientProvider } from '@/features/Lang/LinguiClientProvider';
import { allMessages } from '@/appRouterI18n';
import { UserSourceProvider } from '@/features/Analytics/useUserSource';
import { UrlStateProvider } from '@/features/Url/UrlStateContext';
import { globalInlineCss } from './globalInlineCss';
import Script from 'next/script';
import { CustomAnalyticsHost } from '@/features/Analytics/Custom/CustomAnalyticsHost';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supportedLang = 'en';
  initLingui(supportedLang);

  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <>
      {isProduction && (
        <Script
          defer
          data-website-id="dfid_JALSs2b1efMpdYSaxDEAE"
          data-domain="app.fluencypal.com"
          data-disable-payments="true"
          src="https://datafa.st/js/script.js"
          strategy="afterInteractive"
        />
      )}
      <style
        href="app-global-inline-css"
        precedence="default"
        dangerouslySetInnerHTML={{ __html: globalInlineCss }}
      />
      <UserSourceProvider>
        <ThemeProvider theme={darkTheme}>
          <WindowSizesProvider>
            <AppRouterCacheProvider options={{ key: 'css' }}>
              <LinguiClientProvider
                initialLocale={supportedLang}
                initialMessages={allMessages[supportedLang]!}
              >
                <UrlStateProvider>
                  {children}
                  <CustomAnalyticsHost sourceApp="webapp" />
                </UrlStateProvider>
              </LinguiClientProvider>
            </AppRouterCacheProvider>
          </WindowSizesProvider>
        </ThemeProvider>
      </UserSourceProvider>
    </>
  );
}
