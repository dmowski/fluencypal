"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { useAuth } from "../Auth/useAuth";
import { Stack, Typography } from "@mui/material";
import { SignInForm } from "../Auth/SignInForm";
import { useUsage } from "../Usage/useUsage";
import { useSettings } from "../Settings/useSettings";
import { NoBalanceBlock } from "../Usage/NoBalanceBlock";
import { ConversationCanvas } from "./ConversationCanvas";
import { Dashboard } from "../Dashboard/Dashboard";
import { RolePlayInstruction } from "../RolePlay/types";
import { SupportedLanguage } from "@/common/lang";

interface ConversationPageProps {
  rolePlayScenarios: RolePlayInstruction[];
  lang: SupportedLanguage;
}

export function ConversationPage({ rolePlayScenarios, lang }: ConversationPageProps) {
  const auth = useAuth();
  const settings = useSettings();
  const aiConversation = useAiConversation();
  const usage = useUsage();
  if (settings.loading || auth.loading)
    return (
      <Stack
        sx={{
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            padding: "20px",
            opacity: 0.3,
          }}
          align="center"
        >
          {auth.loading ? "Loading..." : "Loading."}
        </Typography>
      </Stack>
    );
  if (!auth.isAuthorized) return <SignInForm rolePlayScenarios={rolePlayScenarios} lang={lang} />;
  if (usage.balance <= 0.01) return <NoBalanceBlock />;

  return (
    <Stack>
      {aiConversation.isStarted ? (
        <ConversationCanvas />
      ) : (
        <Dashboard rolePlayScenarios={rolePlayScenarios} />
      )}
    </Stack>
  );
}
