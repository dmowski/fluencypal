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
import { HomeworkProvider } from "@/features/Conversation/useHomework";
import { ChatHistoryProvider } from "@/features/Conversation/useChatHistory";
import { AiConversationProvider } from "@/features/Conversation/useAiConversation";
import { TasksProvider } from "@/features/Tasks/useTasks";
import { WordsProvider } from "@/features/Words/useWords";

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
        <ThemeProvider theme={theme}>
          <AppRouterCacheProvider options={{ key: "css" }}>
            <NotificationsProviderWrapper>
              <AuthProvider>
                <WordsProvider>
                  <ChatHistoryProvider>
                    <SettingsProvider>
                      <TasksProvider>
                        <UsageProvider>
                          <HomeworkProvider>
                            <AiConversationProvider>{children}</AiConversationProvider>
                          </HomeworkProvider>
                        </UsageProvider>
                      </TasksProvider>
                    </SettingsProvider>
                  </ChatHistoryProvider>
                </WordsProvider>
              </AuthProvider>
            </NotificationsProviderWrapper>
          </AppRouterCacheProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
