import { Stack, Typography } from "@mui/material";
import { FirstEnterButton } from "./FirstEnterButton";
import { maxLandingWidth } from "./landingSettings";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

interface WelcomeScreenProps {
  title: string;
  openDashboardTitle: string;
  getStartedTitle: string;
  viewPricingTitle: string;
  noCreditCardNeededTitle: string;
  pricingLink: string;
  practiceLink: string;
  lang: SupportedLanguage;
  openMyPracticeLinkTitle: string;
}
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  title,
  openDashboardTitle,
  getStartedTitle,
  viewPricingTitle,
  noCreditCardNeededTitle,
  pricingLink,
  practiceLink,
  lang,
  openMyPracticeLinkTitle,
}) => {
  const i18n = getI18nInstance(lang);
  return (
    <Stack
      sx={{
        maxWidth: maxLandingWidth,
        padding: "120px 10px 280px 10px",
        height: "max-content",
        minHeight: "1200px",
        width: "100%",

        boxSizing: "border-box",
        alignItems: "center",

        gap: "100px",
        "@media (max-width: 900px)": {
          minHeight: "1100px",
        },
        "@media (max-width: 600px)": {
          gap: "20px",
          padding: "90px 0px 150px 0px",
          minHeight: "700px",
        },
        "@media (max-width: 500px)": {
          minHeight: "600px",
        },
      }}
    >
      <Stack
        sx={{
          position: "absolute",
          backgroundColor: `#040608`,
          //backgroundColor: `#1212ff`,
          top: 0,
          left: "0",
          margin: "0 auto",
          width: "100%",
          overflow: "hidden",
          height: "180vh",
          zIndex: -2,

          video: {
            width: "1800px",
            height: "2000px",
            opacity: 1,
            position: "absolute",
            top: "-323px",
            left: "calc(50vw - 990px)",
            "@media (max-width: 1300px)": {
              left: "calc(50vw - 990px + 100px)",
            },
            "@media (max-width: 900px)": {
              top: "-423px",
            },
            "@media (max-width: 600px)": {
              width: "1200px",
              height: "auto",
              left: "-300px",
              top: "0px",
            },
          },
          img: {
            position: "absolute",
            top: "685px",
            left: "calc(50vw - 660px)",
            width: "961px",
            borderRadius: "10px",
            //border: "1px solid rgba(255, 255, 255, 0.1)",

            "@media (max-width: 1300px)": {
              left: "calc(50vw - 660px + 100px)",
            },
            "@media (max-width: 900px)": {
              top: "585px",
            },
            "@media (max-width: 600px)": {
              left: "0",
              width: "calc(100vw)",
              top: "450px",
              borderRadius: 0,
            },
          },
        }}
      >
        <video src={"/landing/flow.webm"} loop muted autoPlay playsInline />
        <img src="/landing/uiChatClean.webp" alt="User Interface" />
      </Stack>
      <Stack
        sx={{
          alignItems: "flex-start",
          width: "100%",
          gap: "30px",
          paddingLeft: "15px",
          paddingTop: "60px",
          "@media (max-width: 1200px)": {
            paddingTop: "30px",
          },
          "@media (max-width: 1000px)": {
            paddingTop: "30px",
          },
          "@media (max-width: 900px)": {
            paddingTop: "30px",
          },
          "@media (max-width: 600px)": {
            gap: "10px",
            paddingLeft: "10px",
          },
        }}
      >
        <Stack
          sx={{
            gap: "20px",
            width: "100%",

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
            sx={{
              fontSize: "0.8rem",
              fontWeight: 700,
              border: "1px solid rgb(5, 172, 255)",
              backgroundColor: "rgba(5, 172, 255, 0.01)",
              padding: "3px 8px",
              borderRadius: "5px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              color: "#05acff",
              width: "max-content",
              "@media (max-width: 600px)": {
                marginBottom: "10px",
              },
            }}
          >
            AI
          </Typography>
          <Typography
            variant="h1"
            component={"h1"}
            sx={{
              fontWeight: 700,
              fontSize: "4.5rem",
              maxWidth: "640px",
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
          <Stack
            sx={{
              gap: "5px",
            }}
          >
            <Typography
              sx={{
                maxWidth: "940px",
                fontSize: "1.1rem",
                "@media (max-width: 600px)": {
                  fontSize: "1rem",
                },
                b: {
                  fontWeight: 700,
                  color: "#05acff",
                },
              }}
            >
              {i18n._(`Talk, get corrected, improve—repeat.`)}
              <br />

              <Typography
                component={"span"}
                sx={{
                  fontSize: "1.1rem",
                  "@media (max-width: 600px)": {
                    fontSize: "1rem",
                  },
                }}
              >
                {i18n._(`Win the game and get the app`)} <b>{i18n._(`for free`)}</b>
              </Typography>
            </Typography>
          </Stack>
        </Stack>

        <Stack
          sx={{
            flexDirection: "row",
            gap: "15px",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            width: "max-content",
            maxWidth: "100%",
            flexWrap: "wrap",
            "@media (max-width: 1200px)": {
              flexDirection: "column",
            },
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
            openMyPracticeLinkTitle={openMyPracticeLinkTitle}
          />
        </Stack>
      </Stack>

      {/** 
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
      </Stack>*/}
    </Stack>
  );
};
