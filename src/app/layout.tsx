import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import { AuthProvider } from "@/features/Auth/useAuth";
import { Roboto } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import { SettingsProvider } from "@/features/Settings/useSettings";
import { UsageProvider } from "@/features/Usage/useUsage";
import { NotificationsProviderWrapper } from "./clientProviders";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Dark Lang - AI teacher",
  description: "Learn english in the dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="./favicon.png" type="image/png" />
      </head>
      <body className={roboto.variable}>
        <NotificationsProviderWrapper>
          <AuthProvider>
            <SettingsProvider>
              <UsageProvider>
                <AppRouterCacheProvider options={{ key: "css" }}>
                  <ThemeProvider theme={theme}>{children}</ThemeProvider>
                </AppRouterCacheProvider>
              </UsageProvider>
            </SettingsProvider>
          </AuthProvider>
        </NotificationsProviderWrapper>
      </body>
    </html>
  );
}
