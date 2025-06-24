"use client";
import { Button, Link, Stack, Typography } from "@mui/material";
import { useAuth } from "./useAuth";
import GoogleIcon from "@mui/icons-material/Google";
import { StarContainer } from "../Layout/StarContainer";
import { useSearchParams } from "next/navigation";
import { useLingui } from "@lingui/react";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getUrlStart } from "../Lang/getUrlStart";
import { RolePlayScenariosInfo } from "../RolePlay/rolePlayData";
import { ArrowUp } from "lucide-react";
import { useIsWebView } from "./useIsWebView";

interface SignInFormProps {
  rolePlayInfo: RolePlayScenariosInfo;
  lang: SupportedLanguage;
}
export const SignInForm = ({ rolePlayInfo, lang }: SignInFormProps) => {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const goalId = searchParams.get("goalId");
  const { i18n } = useLingui();
  const rolePlayId = searchParams.get("rolePlayId");

  const scenario = rolePlayId
    ? rolePlayInfo.rolePlayScenarios.find((scenario) => scenario.id === rolePlayId)
    : null;

  const pageTitle = goalId
    ? i18n._(`Open personal plan`)
    : scenario
      ? scenario.title
      : i18n._(`Start the Lesson`);
  const { isAndroid, agent, isTelegram, inWebView } = useIsWebView();

  const handleSignIn = () => {
    auth.signInWithGoogle();
  };

  if (inWebView) {
    return (
      <Stack
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 999999999,
          width: "100dvw",
          height: "100dvh",

          backgroundColor: "#111214",
        }}
      >
        <Stack sx={{ alignItems: "flex-end", gap: "10px", padding: "20px 15px 0px 10px" }}>
          <ArrowUp
            style={{
              opacity: 0.7,
            }}
          />
          <Stack>
            <Typography
              variant="h3"
              component={"h1"}
              align="right"
              sx={{
                fontWeight: 800,
                fontSize: "2rem",
                padding: "0",
                "@media (max-width: 600px)": {
                  fontSize: "2.3rem",
                },
              }}
            >
              {i18n._("Open this page in browser")}
            </Typography>

            <Typography align="right" sx={{ opacity: 0.8 }}>
              {isAndroid ? (
                <>
                  {i18n._("Please tap the menu ⋮ and choose")}
                  <br />
                  {i18n._("'Open in Chrome' to continue.")}
                </>
              ) : (
                <>
                  {i18n._("Please tap the menu ••• and choose")}
                  <br />
                  {i18n._("'Open in external Browser' to continue.")}
                </>
              )}
            </Typography>
          </Stack>

          <img
            src={
              isTelegram && isAndroid
                ? "/instruction/tgAndroid.png"
                : isTelegram && !isAndroid
                  ? "/instruction/tgIos.png"
                  : isAndroid
                    ? "/instruction/instagramInstructionAndroid.png"
                    : "/instruction/instagramInstruction.png"
            }
            alt="Instagram instruction"
            style={{
              width: "90%",
              boxShadow: "0px 0px 0 3px rgba(200,200,255,0.95)",
              borderRadius: "10px",
              backgroundColor: "#111214",
              maxWidth: "400px",
            }}
          />
        </Stack>
      </Stack>
    );
  }

  return (
    <StarContainer minHeight="min(100vh,1600px)" paddingBottom="160px">
      <Stack
        sx={{
          alignItems: "center",
          gap: "40px",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
          }}
        >
          {scenario ? (
            <Typography
              variant="body2"
              align="center"
              sx={{
                opacity: 0.8,
                textTransform: "uppercase",
              }}
            >
              {i18n._(`Start Role Play:`)}
            </Typography>
          ) : (
            <></>
          )}
          <Typography
            variant="h2"
            component={"h1"}
            align="center"
            sx={{
              fontWeight: 900,
              fontSize: "4rem",
              padding: "0 10px",
              "@media (max-width: 600px)": {
                fontSize: "2.3rem",
              },
            }}
          >
            {pageTitle}
          </Typography>
          <Stack
            sx={{
              alignItems: "center",
              opacity: 0.9,
            }}
          >
            <Typography variant="body1" align="center">
              {i18n._("Create an account to continue")}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          sx={{
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleSignIn}
            startIcon={<GoogleIcon />}
          >
            {i18n._(`Continue with google`)}
          </Button>

          <Stack
            sx={{
              alignItems: "center",
              gap: "0px",
              opacity: 0.9,
            }}
          >
            <Typography variant="caption">
              {i18n._(`By creating an account, you agree to:`)}
            </Typography>
            <Stack
              sx={{
                flexDirection: "row",
                gap: "5px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="caption" align="center">
                <Link href={`${getUrlStart(lang)}privacy`} target="_blank">
                  {i18n._(`Privacy Policy`)}
                </Link>{" "}
                {i18n._("and")}{" "}
                <Link href={`${getUrlStart(lang)}terms`} target="_blank">
                  {i18n._(`Terms of Use`)}
                </Link>
              </Typography>
            </Stack>

            {agent && (
              <Typography
                variant="caption"
                sx={{
                  width: "100dvw",
                  paddingTop: "30px",
                  position: "fixed",
                  bottom: 0,
                  left: 0,
                  lineHeight: "1.1",
                  opacity: 0.4,
                }}
                align="left"
              >
                <small>{agent}</small>
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </StarContainer>
  );
};
