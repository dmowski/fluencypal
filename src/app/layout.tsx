import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../features/uiKit/theme";
import { initLingui } from "@/initLingui";
import linguiConfig from "../../lingui.config";
import { supportedLanguages } from "@/common/lang";
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
        <script defer data-domain="fluencypal.com" src="https://plausible.io/js/script.js"></script>
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-16463260124"></script>
        <Script>
          {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'AW-16463260124');
`}
        </Script>
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <AppRouterCacheProvider options={{ key: "css" }}>{children}</AppRouterCacheProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
