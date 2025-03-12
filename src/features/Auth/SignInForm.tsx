"use client";
import { Button, Link, Stack, Typography } from "@mui/material";
import { useAuth } from "./useAuth";
import GoogleIcon from "@mui/icons-material/Google";
import { StarContainer } from "../Layout/StarContainer";
import { useSearchParams } from "next/navigation";
import { RolePlayInstruction } from "../RolePlay/types";
import { useLingui } from "@lingui/react";
import { SupportedLanguage } from "@/common/lang";

interface SignInFormProps {
  rolePlayScenarios: RolePlayInstruction[];
  lang: SupportedLanguage;
}
export const SignInForm = ({ rolePlayScenarios, lang }: SignInFormProps) => {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const { i18n } = useLingui();
  const rolePlayId = searchParams.get("rolePlayId");
  const scenario = rolePlayId
    ? rolePlayScenarios.find((scenario) => scenario.id === rolePlayId)
    : null;

  const pageTitle = scenario ? scenario.title : i18n._(`Start the Lesson`);
  return (
    <StarContainer minHeight="100vh" paddingBottom="160px">
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
                fontSize: "3rem",
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
              {i18n._("Create an account, select a language and start practicing")}
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
            onClick={() => auth.signInWithGoogle()}
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
              }}
            >
              <Link href={`/${lang}/privacy`} target="_blank">
                <Typography variant="caption">{i18n._(`Privacy Policy`)}</Typography>
              </Link>
              <Link href={`/${lang}/terms`} target="_blank">
                <Typography variant="caption">{i18n._(`Terms of Use`)}</Typography>
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </StarContainer>
  );
};
