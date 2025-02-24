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
import { HomeworkProvider } from "@/features/Homework/useHomework";
import { ChatHistoryProvider } from "@/features/ConversationHistory/useChatHistory";
import { AiConversationProvider } from "@/features/Conversation/useAiConversation";
import { TasksProvider } from "@/features/Tasks/useTasks";
import { WordsProvider } from "@/features/Words/useWords";
import { RulesProvider } from "@/features/Rules/useRules";
import { TextAiProvider } from "@/features/Ai/useTextAi";

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
                <SettingsProvider>
                  <UsageProvider>
                    <TextAiProvider>
                      <WordsProvider>
                        <ChatHistoryProvider>
                          <RulesProvider>
                            <TasksProvider>
                              <HomeworkProvider>
                                <AiConversationProvider>{children}</AiConversationProvider>
                              </HomeworkProvider>
                            </TasksProvider>
                          </RulesProvider>
                        </ChatHistoryProvider>
                      </WordsProvider>
                    </TextAiProvider>
                  </UsageProvider>
                </SettingsProvider>
              </AuthProvider>
            </NotificationsProviderWrapper>
          </AppRouterCacheProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
