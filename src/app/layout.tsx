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
import { initLingui } from "@/initLingui";
import linguiConfig from "../../lingui.config";
import { supportedLanguages } from "@/common/lang";
import { generateMetadataInfo } from "@/libs/metadata";
import { Inter, Old_Standard_TT } from "next/font/google";
import { WebCamProvider } from "@/features/webCam/useWebCam";
import { CorrectionsProvider } from "@/features/Corrections/useCorrections";

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
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <AppRouterCacheProvider options={{ key: "css" }}>
            <NotificationsProviderWrapper>
              <AuthProvider>
                <SettingsProvider>
                  <WebCamProvider>
                    <UsageProvider>
                      <TextAiProvider>
                        <AudioProvider>
                          <AiUserInfoProvider>
                            <WordsProvider>
                              <CorrectionsProvider>
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
                              </CorrectionsProvider>
                            </WordsProvider>
                          </AiUserInfoProvider>
                        </AudioProvider>
                      </TextAiProvider>
                    </UsageProvider>
                  </WebCamProvider>
                </SettingsProvider>
              </AuthProvider>
            </NotificationsProviderWrapper>
          </AppRouterCacheProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
