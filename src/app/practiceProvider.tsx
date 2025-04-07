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

export const PracticeProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return (
    <Suspense>
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
    </Suspense>
  );
};
