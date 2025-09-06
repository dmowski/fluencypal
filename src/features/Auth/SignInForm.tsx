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
import { WebViewWall } from "./WebViewWall";
import { AuthWall } from "../Goal/Quiz/QuizPage2";

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
      : i18n._(`Sing in `);

  const singInSubTitle = goalId
    ? i18n._(`So you can keep your progress`)
    : scenario
      ? i18n._(`So you can save your progress in ${scenario.title}`)
      : i18n._(`So you can save your progress`);

  return (
    <WebViewWall>
      <Stack
        sx={{
          width: "100%",
          paddingTop: `20px`,
          paddingBottom: `10px`,
          alignItems: "center",
        }}
      >
        <AuthWall signInTitle={pageTitle} singInSubTitle={singInSubTitle}>
          <></>
        </AuthWall>
      </Stack>
    </WebViewWall>
  );
};
