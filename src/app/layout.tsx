import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "../features/uiKit/theme";
import { initLingui } from "@/initLingui";
import { generateMetadataInfo } from "@/libs/metadata";
import { Inter, Old_Standard_TT } from "next/font/google";
import Script from "next/script";
import "@telegram-apps/telegram-ui/dist/styles.css";
import { WindowSizesProvider } from "@/features/Layout/useWindowSizes";
import { Suspense } from "react";
import { headers } from "next/headers";
import { SupportedLanguage, supportedLanguages } from "@/features/Lang/lang";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const oldStandardTT = Old_Standard_TT({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataInfo({
    lang: "en",
    currentPath: "",
  });
}

const defaultLang: SupportedLanguage = "en";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Extract language from URL path
  const headersList = await headers();
  const pathname = headersList.get("x-current-path") || "";

  // Extract lang from pathname like /ru or /ru/something
  const pathSegments = pathname.split("/").filter(Boolean);
  const firstSegment = (pathSegments[0] || "") as SupportedLanguage;

  // Initialize Lingui with the detected language
  const supportedLang = supportedLanguages.find((l) => l === firstSegment) || defaultLang;
  initLingui(supportedLang);

  return (
    <html
      lang={supportedLang}
      className={`${inter.className} ${oldStandardTT.className}`}
      translate="no"
    >
      <head>
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="26x26" href="/favicon-26x26.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="google" content="notranslate" />
        <link rel="apple-touch-icon" href="/logo192.png" />

        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-K2X9LZJ50W"
        ></Script>
        <Script id="gtag-init" strategy="afterInteractive">
          {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-K2X9LZJ50W'); 
gtag('config', 'AW-16463260124');

`}
        </Script>
        <Script>
          {`
const isWindow = typeof window !== "undefined";
const isLocalhost = isWindow && window.location.hostname === "localhost";
if (!isLocalhost && isWindow) {
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:6370217,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
}
`}
        </Script>
      </head>
      <body>
        <ThemeProvider theme={darkTheme}>
          <Suspense>
            <WindowSizesProvider>
              <AppRouterCacheProvider options={{ key: "css" }}>{children}</AppRouterCacheProvider>
            </WindowSizesProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
