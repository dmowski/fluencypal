import { AuthProvider } from "@/features/Auth/useAuth";
import { SettingsProvider } from "@/features/Settings/useSettings";
import { UsageProvider } from "@/features/Usage/useUsage";
import { HomeworkProvider } from "@/features/Homework/useHomework";
import { ChatHistoryProvider } from "@/features/ConversationHistory/useChatHistory";
import { AiConversationProvider } from "@/features/Conversation/useAiConversation";
import { TasksProvider } from "@/features/Tasks/useTasks";
import { WordsProvider } from "@/features/Words/useWords";
import { RulesProvider } from "@/features/Rules/useRules";
import { TextAiProvider } from "@/features/Ai/useTextAi";
import { AiUserInfoProvider } from "@/features/Ai/useAiUserInfo";
import { AudioProvider } from "@/features/Audio/useAudio";
import { WebCamProvider } from "@/features/webCam/useWebCam";
import { CorrectionsProvider } from "@/features/Corrections/useCorrections";
import { JSX, Suspense } from "react";
import { NotificationsProvider } from "@toolpad/core/useNotifications";
import { PlanProvider } from "@/features/Plan/usePlan";
import { GameProvider } from "@/features/Game/useGame";
import { TelegramProvider } from "./telegramProvider";
import { TgNavigationProvider } from "@/features/Telegram/useTgNavigation";
import { AppNavigationProvider } from "@/features/Navigation/useAppNavigation";
import { AnalyticsProvider } from "@/features/Analytics/useAnalytics";
import { ChatProvider } from "@/features/Chat/useChat";
import { BattleProvider } from "@/features/Game/Battle/useBattle";
import { GlobalModals } from "@/features/Modal/GlobalModals";

export const PracticeProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <Suspense>
      <TelegramProvider>
        <TgNavigationProvider>
          <AppNavigationProvider>
            <NotificationsProvider>
              <AuthProvider>
                <AnalyticsProvider>
                  <SettingsProvider>
                    <WebCamProvider>
                      <GameProvider>
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
                                            <PlanProvider>
                                              <AiConversationProvider>
                                                <ChatProvider>
                                                  <BattleProvider>
                                                    {children}
                                                    <GlobalModals />
                                                  </BattleProvider>
                                                </ChatProvider>
                                              </AiConversationProvider>
                                            </PlanProvider>
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
                      </GameProvider>
                    </WebCamProvider>
                  </SettingsProvider>
                </AnalyticsProvider>
              </AuthProvider>
            </NotificationsProvider>
          </AppNavigationProvider>
        </TgNavigationProvider>
      </TelegramProvider>
    </Suspense>
  );
};
