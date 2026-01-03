"use client";

import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useSettings } from "../Settings/useSettings";
import { useLingui } from "@lingui/react";
import { CreditCard, Gem } from "lucide-react";
import { useUsage } from "../Usage/useUsage";
import { useEffect, useState } from "react";
import { useAuth } from "../Auth/useAuth";
import { isTMA } from "@telegram-apps/sdk-react";
import { SupportedLanguage } from "../Lang/lang";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { createSetupIntentRequest } from "./createSetupIntentRequest";
import { VerifyCard } from "./CardValidator";
import { ColorIconTextList } from "../Survey/ColorIconTextList";
import { NavigationBar } from "../Navigation/NavigationBar";
import { useAccess } from "../Usage/useAccess";

export const CardValidatorWall = ({ lang }: { lang: SupportedLanguage }) => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const access = useAccess();
  const auth = useAuth();
  const isLoadingSettings = settings.loading;
  const isCreditCardConfirmed = settings.userSettings?.isCreditCardConfirmed;
  const [isShowForm, setIsShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isTg, setIsTg] = useState(false);

  const [isShowHowToUseForFree, setIsShowHowToUseForFree] = useState(false);

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

  if (isCreditCardConfirmed || isLoadingSettings || isTg) return <></>;
  if (access.isFullAppAccess) return <></>;

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
            marginTop: "-40px",
            width: "100%",
            "@media (max-width: 700px)": {
              marginTop: "0px",
            },
          }}
        >
          <NavigationBar lang={lang} />
        </Stack>
        <Stack
          sx={{
            maxWidth: "720px",
            width: "100%",
            alignItems: "flex-start",
            gap: "30px",
            padding: "0px 20px 20px 20px",
            "@media (max-width: 700px)": {
              padding: "20px 10px 140px 10px",
            },
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
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      "@media (max-width: 700px)": {
                        fontSize: "30px",
                      },
                    }}
                  >
                    {isShowHowToUseForFree
                      ? i18n._("How to use for free")
                      : i18n._("Credit Card Check")}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      paddingTop: "10px",
                      "@media (max-width: 700px)": {
                        fontSize: "14px",
                      },
                    }}
                  >
                    {isShowHowToUseForFree
                      ? i18n._("Simple steps to get the app for free.")
                      : i18n._("Please confirm your credit card to access all features.")}
                  </Typography>
                </Stack>

                <Stack>
                  <ColorIconTextList
                    gap="10px"
                    listItems={
                      isShowHowToUseForFree
                        ? [
                            {
                              iconName: "credit-card",
                              title: i18n._("1. Confirm your credit card details"),
                            },
                            {
                              iconName: "piggy-bank",
                              title: i18n._("2. Complete the trial period"),
                            },
                            {
                              iconName: "x",
                              title: i18n._("3. Don't pay anything"),
                            },
                            {
                              iconName: "swords",
                              title: i18n._("4. Play the game and become one of the top 5 players"),
                            },
                            {
                              iconName: "trophy",
                              title: i18n._("5. Winners get full access for free "),
                            },
                          ]
                        : [
                            {
                              iconName: "sparkles",
                              title: i18n._("You will get a trial period of full access for free"),
                            },
                            {
                              iconName: "piggy-bank",
                              title: i18n._("No automatic payment after the trial"),
                            },
                            {
                              iconName: "shield-check",
                              title: i18n._("No charge will be made"),
                            },
                          ]
                    }
                    iconSize={"24px"}
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
                  variant={"contained"}
                  size="large"
                  color="info"
                  startIcon={<CreditCard />}
                  onClick={() => onStartValidation()}
                >
                  {i18n._("Confirm Credit Card")}
                </Button>

                <Button
                  variant={isShowHowToUseForFree ? "outlined" : "text"}
                  size="large"
                  color="info"
                  endIcon={<Gem />}
                  onClick={() => setIsShowHowToUseForFree(!isShowHowToUseForFree)}
                >
                  {i18n._("How to use for free")}
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Stack>
    </CustomModal>
  );
};
