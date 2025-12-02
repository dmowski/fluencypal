import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import { darkTheme } from "../features/uiKit/theme";
import { Inter, Old_Standard_TT } from "next/font/google";
import "@telegram-apps/telegram-ui/dist/styles.css";
import { WindowSizesProvider } from "@/features/Layout/useWindowSizes";
import { initLingui } from "@/initLingui";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { allMessages } from "@/appRouterI18n";
import { UserSourceProvider } from "@/features/Analytics/useUserSource";

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
    <UserSourceProvider>
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
    </UserSourceProvider>
  );
}
