"use client";

import { useAiConversation } from "@/features/Conversation/useAiConversation";
import { useAuth } from "../Auth/useAuth";
import { Stack, Typography } from "@mui/material";
import { SignInForm } from "../Auth/SignInForm";
import { useUsage } from "../Usage/useUsage";
import { useSettings } from "../Settings/useSettings";
import { NoBalanceBlock } from "../Usage/NoBalanceBlock";
import { ConversationBoard } from "./ConversationBoard";
import { Dashboard } from "./Dashboard";

export function ConversationPage() {
  const auth = useAuth();
  const settings = useSettings();
  const aiConversation = useAiConversation();
  const usage = useUsage();

  if (settings.loading || auth.loading)
    return (
      <Typography
        sx={{
          padding: "20px",
          opacity: 0.5,
        }}
        align="center"
      >
        {auth.loading ? "auth loading" : "Settings loading"}
      </Typography>
    );
  if (!auth.isAuthorized) return <SignInForm />;
  if (usage.balance <= 0) return <NoBalanceBlock />;

  return <Stack>{aiConversation.isStarted ? <ConversationBoard /> : <Dashboard />}</Stack>;
}
