import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "../features/uiKit/theme";
import { initLingui } from "@/initLingui";
import linguiConfig from "../../lingui.config";
import { supportedLanguages } from "@/features/Lang/lang";
import { generateMetadataInfo } from "@/libs/metadata";
import { Inter, Old_Standard_TT } from "next/font/google";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const oldStandardTT = Old_Standard_TT({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export async function generateStaticParams() {
  return linguiConfig.locales.map((lang: string) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataInfo({
    lang: "en",
    currentPath: "",
  });
}

const defaultLang = "en";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const lang: string = (await params)?.lang || defaultLang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);

  return (
    <html lang={lang} className={`${inter.className} ${oldStandardTT.className}`}>
      <head>
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="26x26" href="/favicon-26x26.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
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
          <AppRouterCacheProvider options={{ key: "css" }}>{children}</AppRouterCacheProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
