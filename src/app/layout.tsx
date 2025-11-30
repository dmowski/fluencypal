import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "../features/uiKit/theme";
import { Inter, Old_Standard_TT } from "next/font/google";
import Script from "next/script";
import "@telegram-apps/telegram-ui/dist/styles.css";
import { WindowSizesProvider } from "@/features/Layout/useWindowSizes";
import { initLingui } from "@/initLingui";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { allMessages } from "@/appRouterI18n";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const oldStandardTT = Old_Standard_TT({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supportedLang = "en";
  initLingui(supportedLang);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-K2X9LZJ50W"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-K2X9LZJ50W'); 
gtag('config', 'AW-16463260124');

`}
      </Script>

      <ThemeProvider theme={darkTheme}>
        <WindowSizesProvider>
          <AppRouterCacheProvider options={{ key: "css" }}>
            <LinguiClientProvider
              initialLocale={supportedLang}
              initialMessages={allMessages[supportedLang]!}
            >
              {children}
            </LinguiClientProvider>
          </AppRouterCacheProvider>
        </WindowSizesProvider>
      </ThemeProvider>
    </>
  );
}
