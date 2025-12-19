"use client";

import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useSettings } from "../Settings/useSettings";
import { useLingui } from "@lingui/react";
import { CreditCard } from "lucide-react";
import { useUsage } from "../Usage/useUsage";
import { useEffect, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import dayjs from "dayjs";
import { IconTextList } from "../Survey/IconTextList";
import { isTMA } from "@telegram-apps/sdk-react";
import { SupportedLanguage } from "../Lang/lang";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { createSetupIntentRequest } from "./createSetupIntentRequest";
import { VerifyCard } from "./CardValidator";
import { useAiConversation } from "../Conversation/useAiConversation";

export const CardValidatorWall = ({ lang }: { lang: SupportedLanguage }) => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const usage = useUsage();
  const auth = useAuth();
  const isLoadingSettings = settings.loading;
  const isCreditCardConfirmed = settings.userSettings?.isCreditCardConfirmed;
  const [isShowForm, setIsShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isTg, setIsTg] = useState(false);
  const conversation = useAiConversation();
  const activeConversationMessageCount = conversation.conversation.length;

  useEffect(() => {
    const isTelegramApp = isTMA();
    setIsTg(isTelegramApp);
  }, []);

  const onStartValidation = async () => {
    setIsLoading(true);
    try {
      const authToken = await auth.getToken();
      const { clientSecret } = await createSetupIntentRequest({}, authToken);
      setClientSecret(clientSecret);
      setIsShowForm(true);
    } finally {
      setIsLoading(false);
    }
  };
  const createdAtIso = settings.userSettings?.createdAtIso;
  const daysFromCreation = createdAtIso ? dayjs().diff(dayjs(createdAtIso), "day") : null;
  const isNewUser = !createdAtIso || (daysFromCreation !== null && daysFromCreation < 5);

  if (isCreditCardConfirmed || isLoadingSettings || isTg) return <></>;
  if (usage.isFullAccess && !isNewUser) return <></>;
  if (activeConversationMessageCount < 3) return <></>;
  return (
    <CustomModal isOpen={true}>
      <Stack
        sx={{
          alignItems: "center",
          width: "100%",
        }}
      >
        <Stack
          sx={{
            maxWidth: "720px",
            width: "100%",
            alignItems: "flex-start",
            gap: "30px",
            padding: "20px 20px",
          }}
        >
          {isLoading && <CircularProgress />}
          {isShowForm && clientSecret && <VerifyCard lang={lang} clientSecret={clientSecret} />}
          {!isShowForm && !isLoading && (
            <>
              <Stack
                sx={{
                  gap: "25px",
                }}
              >
                <Stack>
                  <Typography variant="h3">{i18n._("Credit Card Check")}</Typography>
                  <Typography variant="body2">
                    {i18n._("Please confirm your credit card to access all features.")}
                  </Typography>
                </Stack>
                <Stack>
                  <IconTextList
                    gap="10px"
                    listItems={[
                      {
                        iconName: "sparkles",
                        title: i18n._("You will get 3 days of full access for free"),
                      },
                      {
                        iconName: "piggy-bank",
                        title: i18n._("No automatic payment after the trial"),
                      },
                      {
                        iconName: "shield-check",
                        title: i18n._("No charge will be made"),
                      },
                    ]}
                  />
                </Stack>
              </Stack>

              <Stack
                sx={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  color="info"
                  startIcon={<CreditCard />}
                  onClick={() => onStartValidation()}
                >
                  {i18n._("Confirm Credit Card")}
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Stack>
    </CustomModal>
  );
};
