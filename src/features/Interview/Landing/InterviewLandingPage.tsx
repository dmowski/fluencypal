import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewData } from "../types";
import { I18n } from "@lingui/core";
import { Stack } from "@mui/material";
import { InterviewHeader } from "./InterviewHeader";
import { MainTitleSection } from "./MainTitleSection";
import { InfoCards } from "./InfoCards";
import { Info, MessageSquare, PhoneCall, Sparkles, TrendingUp } from "lucide-react";

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
            label={interviewData.jobTitle}
            title={interviewData.title}
            subtitle={interviewData.subTitle}
            buttonHref={"/practice"}
            buttonTitle={"Start Your Interview Test"}
          />
          <InfoCards
            title={"What you will achieve"}
            subtitle={"Real outcomes that transform your interview performance"}
            buttonTitle={"Start Free Trial"}
            buttonHref={"/test"}
            cards={[
              {
                icon: MessageSquare,
                title: "Strong, structured answers",
                description: "Stop rambling or guessing. You'll know exactly what to say.",
              },
              {
                icon: Sparkles,
                title: "Confidence & presence",
                description: "Perform calmly under pressure and make a strong first impression.",
              },
              {
                icon: PhoneCall,
                title: "More interview invites",
                description: "Better preparation = better interviews = more callbacks.",
              },
              {
                icon: TrendingUp,
                title: "Higher salary opportunities",
                description: "A strong interview performance increases negotiating power.",
              },
            ]}
          />
        </Stack>
      </main>
    </Stack>
  );
}
