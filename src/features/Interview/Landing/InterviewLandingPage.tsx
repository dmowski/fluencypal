import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewData } from "../types";
import { I18n } from "@lingui/core";
import { Stack } from "@mui/material";
import { InterviewHeader } from "./InterviewHeader";
import { MainTitleSection } from "./MainTitleSection";

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
    <Stack sx={{ width: "100%", margin: 0, padding: 0 }}>
      <InterviewHeader interviewId={id} lang={lang} />
      <main style={{ width: "100%", margin: 0 }}>
        <Stack sx={{ alignItems: "center" }}>
          <MainTitleSection
            label={"Senior Frontend Developer"}
            title={"Get more job offers with  answers that stand out"}
            subtitle={
              "Prepare for system design, leadership, and advanced frontend questions. Get your personalized interview action plan"
            }
            buttonHref={"/practice"}
            buttonTitle={"Start Your Interview Test"}
          />
        </Stack>
      </main>
    </Stack>
  );
}
