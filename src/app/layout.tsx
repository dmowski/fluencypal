import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import "./globals.css";
import { AuthProvider } from "@/features/Auth/useAuth";
import { Roboto } from "next/font/google";
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

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

const siteUrl = "https://dark-lang.net/";

export const metadata: Metadata = {
  title: "Online English with AI Teacher",
  description:
    "Experience next-level language practice with Bruno, your friendly AI tutor. Whether you're a beginner or advanced learner, Bruno adapts to your pace, corrects mistakes, and keeps you motivated.",

  keywords: [
    "Online English",
    "Learn English",
    "AI Language Tutor",
    "English Practice",
    "Dark Lang",
    "Language Learning",
  ],
  openGraph: {
    title: "Online English with AI Teacher | Dark Lang",
    description:
      "Learn English (or other languages) with Bruno, your friendly AI tutor. Beginner, instant corrections, and advanced modes help you improve fast—no scheduling required.",
    url: siteUrl,
    siteName: "Dark Lang",
    images: [
      {
        url: `${siteUrl}/openGraph.png`,
        width: 1200,
        height: 630,
        alt: "Dark Lang - Online English with AI Teacher",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Online English with AI Teacher | Dark Lang",
    description:
      "Practice speaking English, French, or another language with a personalized AI tutor named Bruno.",
    images: [`${siteUrl}/openGraph.png`],
    creator: "@dmowskii",
  },
  robots: {
    index: true,
    follow: true,
  },
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
