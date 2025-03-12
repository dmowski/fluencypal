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
import { robots, siteUrl } from "@/common/metadata";
import { initLingui } from "@/initLingui";
import linguiConfig from "../../lingui.config";
import { supportedLanguages } from "@/common/lang";
import { getI18nInstance } from "@/appRouterI18n";

export async function generateStaticParams() {
  return linguiConfig.locales.map((lang: string) => ({ lang }));
}

export const metadata: Metadata = {
  title: "FluencyPal – AI English Speaking Practice for Fluency & Confidence",
  alternates: {
    canonical: `https://www.fluencypal.com/`,
  },
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
  openGraph: {
    title: "FluencyPal – AI English Speaking Practice",
    description:
      "Practice conversational English anytime with FluencyPal, your personal AI English tutor. Improve fluency, pronunciation, and confidence through realistic, immersive conversations.",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}openGraph.png`,
        width: 1200,
        height: 630,
        alt: "FluencyPal - AI English Speaking Practice App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FluencyPal – Your AI English Speaking Partner",
    description:
      "FluencyPal helps intermediate and advanced learners improve English speaking fluency through personalized AI-driven conversations. Available 24/7, no subscriptions required.",
    images: [`${siteUrl}openGraph.png`],
    creator: "@dmowskii",
  },
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
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";

  initLingui(supportedLang);

  return (
    <html lang={lang}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
      </head>
      <body>
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
      </body>
    </html>
  );
}
