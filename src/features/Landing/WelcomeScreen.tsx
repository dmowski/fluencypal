import { Stack, Typography } from "@mui/material";
import { FirstEnterButton } from "./FirstEnterButton";
import { maxLandingWidth, subTitleFontStyle } from "./landingSettings";
import { ConversationCard } from "../Dashboard/ConversationCard";
import { getI18nInstance } from "@/appRouterI18n";
import { SupportedLanguage } from "@/common/lang";
import { ConversationLandingCard } from "./ConversationLandingCard";
import { getUrlStart } from "../Lang/getUrlStart";

interface WelcomeScreenProps {
  title: string;
  subTitle: string;
  openDashboardTitle: string;
  getStartedTitle: string;
  viewPricingTitle: string;
  noCreditCardNeededTitle: string;
  pricingLink: string;
  practiceLink: string;
  lang: SupportedLanguage;
}
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  title,
  subTitle,
  openDashboardTitle,
  getStartedTitle,
  viewPricingTitle,
  noCreditCardNeededTitle,
  pricingLink,
  practiceLink,
  lang,
}) => {
  const i18n = getI18nInstance(lang);
  return (
    <Stack
      sx={{
        maxWidth: maxLandingWidth,
        padding: "150px 10px 80px 10px",
        height: "max-content",

        boxSizing: "border-box",
        alignItems: "center",
        justifyContent: "center",
        gap: "100px",
        "@media (max-width: 600px)": {
          gap: "20px",
          paddingTop: "130px",
        },
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          gap: "50px",
          "@media (max-width: 600px)": {
            gap: "10px",
          },
        }}
      >
        <Stack
          sx={{
            gap: "20px",
            alignItems: "center",
            ".logoContainer": {
              padding: "20px",
              "@media (max-width: 600px)": {
                display: "none",
              },
            },
            "@media (max-width: 600px)": {
              gap: "5px",
            },
          }}
        >
          <Typography
            align="center"
            variant="h1"
            component={"h1"}
            sx={{
              fontWeight: 700,
              "@media (max-width: 1300px)": {
                fontSize: "4rem",
              },
              "@media (max-width: 900px)": {
                fontSize: "3rem",
              },
              "@media (max-width: 700px)": {
                fontSize: "2rem",
              },
            }}
          >
            {title}
          </Typography>
          <Typography
            align="center"
            variant="body1"
            sx={{
              maxWidth: "940px",
              ...subTitleFontStyle,
              "@media (max-width: 600px)": {
                fontSize: "1rem",
              },
            }}
          >
            {subTitle}
          </Typography>
        </Stack>

        <Stack
          sx={{
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <FirstEnterButton
            showPricingButton
            openDashboardTitle={openDashboardTitle}
            getStartedTitle={getStartedTitle}
            viewPricingTitle={viewPricingTitle}
            noCreditCardNeededTitle={noCreditCardNeededTitle}
            practiceLink={practiceLink}
            pricingLink={pricingLink}
          />
        </Stack>
      </Stack>

      <Stack
        sx={{
          gap: "20px",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          "@media (max-width: 1100px)": {
            gridTemplateColumns: "1fr 1fr",
          },

          "@media (max-width: 750px)": {
            gridTemplateColumns: "1fr",
            gap: "10px",
          },
        }}
      >
        <ConversationLandingCard
          title={i18n._(`Plan`)}
          subTitle={i18n._(`Get your personalized plan`)}
          href={`${getUrlStart(lang)}practice`}
          startColor="#4F46E5"
          endColor="#A78BFA"
          bgColor="#60A5FA"
          icon={
            <Stack>
              <Stack
                style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                className="avatar"
              >
                <img src="/avatar/map.webp" alt="Target" />
              </Stack>
            </Stack>
          }
          actionLabel={i18n._(`Takes ~5 min`)}
        />
        <ConversationLandingCard
          href={`${getUrlStart(lang)}practice`}
          title={i18n._(`Conversations`)}
          subTitle={i18n._(`Talk to the AI and it will respond to you`)}
          startColor="#03a665"
          endColor="#3B82F6"
          bgColor="#A3E635"
          icon={
            <Stack>
              <Stack
                style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                className="avatar"
              >
                <img src="/avatar/girl.webp" alt="Girl" />
              </Stack>
            </Stack>
          }
          actionLabel={i18n._(`Start Talking`)}
        />

        <ConversationLandingCard
          title={i18n._(`Examples`)}
          subTitle={i18n._(`AI will lead you through the conversation`)}
          href={`${getUrlStart(lang)}practice`}
          startColor="#d13434"
          endColor="#FFD93D"
          bgColor="#5EEAD4"
          icon={
            <Stack>
              <Stack
                style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                className="avatar"
              >
                <img src="/avatar/owl1.webp" alt="Owl" />
              </Stack>
            </Stack>
          }
          actionLabel={i18n._(`Guide Me`)}
        />

        <ConversationLandingCard
          title={i18n._(`Rules`)}
          subTitle={i18n._(`Get a personal grammar rule to learn`)}
          href={`${getUrlStart(lang)}practice`}
          startColor="#9d43a3"
          endColor="#086787"
          bgColor="#990000"
          icon={
            <Stack>
              <Stack
                style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                className="avatar"
              >
                <img src="/avatar/book.webp" alt="Book" />
              </Stack>
            </Stack>
          }
          actionLabel={i18n._(`Get a Rule`)}
        />

        <ConversationLandingCard
          title={i18n._(`Words`)}
          subTitle={i18n._(`Practice new vocabulary with the AI`)}
          href={`${getUrlStart(lang)}practice`}
          startColor="#0276c4"
          endColor="#086787"
          bgColor="#5EEAD4"
          icon={
            <Stack>
              <Stack
                style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                className="avatar"
              >
                <img src="/avatar/words.webp" alt="Cars with words" />
              </Stack>
            </Stack>
          }
          actionLabel={i18n._(`Expand Vocabulary`)}
        />

        <ConversationLandingCard
          title={i18n._(`Role Plays`)}
          subTitle={i18n._(`Real-life situations with the AI`)}
          href={`${getUrlStart(lang)}practice`}
          startColor="#4F46E5"
          endColor="#086787"
          bgColor="#990000"
          icon={
            <Stack>
              <Stack
                style={{ width: "var(--icon-size)", height: "var(--icon-size)" }}
                className="avatar"
              >
                <img src="/avatar/talk3.webp" alt="People talking" />
              </Stack>
            </Stack>
          }
          actionLabel={i18n._(`Play a Role`)}
        />
      </Stack>
    </Stack>
  );
};
