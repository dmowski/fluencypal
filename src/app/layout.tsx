import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import { AuthProvider } from "@/features/Auth/useAuth";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../features/uiKit/theme";
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
import { AiUserInfoProvider } from "@/features/Ai/useAiUserInfo";
import { CookiesPopup } from "@/features/Legal/CookiesPopup";
import { AudioProvider } from "@/features/Audio/useAudio";
import { openGraph, robots, twitter } from "@/common/metadata";
import { initLingui } from "@/initLingui";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { allMessages } from "@/appRouterI18n";

export const metadata: Metadata = {
  title: "FluencyPal – AI English Speaking Practice for Fluency & Confidence",
  description:
    "Practice conversational English with FluencyPal, your 24/7 AI English tutor and speaking coach. Improve fluency, pronunciation, and confidence through real-life role-play scenarios with instant feedback.",

  keywords: [
    "ai English tutor",
    "English speaking practice app",
    "improve English fluency",
    "advanced English conversation",
    "English speaking coach",
    "conversational English practice",
    "language immersion app",
    "English speaking partner",
  ],
  openGraph: openGraph,
  twitter: twitter,
  robots: robots,
};

const defaultLang = "en";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const lang: string = (await params)?.lang || defaultLang;
  initLingui(lang);

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
      </head>
      <body>
        <LinguiClientProvider initialLocale={lang} initialMessages={allMessages[lang]!}>
          <ThemeProvider theme={theme}>
            <AppRouterCacheProvider options={{ key: "css" }}>
              <NotificationsProviderWrapper>
                <AuthProvider>
                  <SettingsProvider>
                    <UsageProvider>
                      <TextAiProvider>
                        <AudioProvider>
                          <AiUserInfoProvider>
                            <WordsProvider>
                              <ChatHistoryProvider>
                                <RulesProvider>
                                  <TasksProvider>
                                    <HomeworkProvider>
                                      <AiConversationProvider>{children}</AiConversationProvider>
                                      <CookiesPopup />
                                    </HomeworkProvider>
                                  </TasksProvider>
                                </RulesProvider>
                              </ChatHistoryProvider>
                            </WordsProvider>
                          </AiUserInfoProvider>
                        </AudioProvider>
                      </TextAiProvider>
                    </UsageProvider>
                  </SettingsProvider>
                </AuthProvider>
              </NotificationsProviderWrapper>
            </AppRouterCacheProvider>
          </ThemeProvider>
        </LinguiClientProvider>
      </body>
    </html>
  );
}
