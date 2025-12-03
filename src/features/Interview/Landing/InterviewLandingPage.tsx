import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewData } from "../types";
import { I18n } from "@lingui/core";
import { Stack } from "@mui/material";
import { WelcomeScreen } from "@/features/Landing/WelcomeScreen";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { PlanLandingBlock } from "@/features/Landing/PlanLandingBlock";
import { InterviewHeader } from "./InterviewHeader";

export async function InterviewLandingPage({
  lang,
  id,
  interviewData,
  i18n,
}: {
  lang: SupportedLanguage;
  id: string;
  interviewData: InterviewData;
  i18n: I18n;
}) {
  return (
    <>
      <InterviewHeader interviewId={id} lang={lang} />
      <main style={{ width: "100%", margin: 0 }}>
        <Stack sx={{ alignItems: "center" }}>
          <WelcomeScreen
            getStartedTitle={i18n._(`Get Started`)}
            pricingLink={`${getUrlStart(lang)}pricing`}
            practiceLink={`${getUrlStart(lang)}quiz`}
            openMyPracticeLinkTitle={i18n._(`Open`)}
            lang={lang}
            title={interviewData.title}
            subTitle={interviewData.subTitle}
          />
          <PlanLandingBlock lang={lang} />
        </Stack>
      </main>
    </>
  );
}
