import { Button, Stack, Typography } from "@mui/material";
import { useUsage } from "./useUsage";
import { Swords, Telescope, Wallet } from "lucide-react";
import { JSX } from "react";
import { ContactList } from "../Landing/Contact/ContactList";

import { useLingui } from "@lingui/react";
import { GradientBgImageCard } from "../uiKit/Card/GradientBgCard";
import { SupportedLanguage } from "../Lang/lang";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { getUrlStart } from "../Lang/getUrlStart";
import { useRouter } from "next/navigation";
import { usePayWall } from "../PayWall/usePayWall";

const WinCard = ({
  title,
  icon,
  subTitle,
  src,
  onClick,
}: {
  title: string;
  icon: JSX.Element;
  subTitle: string;
  src: string;
  onClick?: () => void;
}) => {
  return (
    <GradientBgImageCard src={src} onClick={() => onClick?.()} backgroundColor={""}>
      <Stack
        sx={{
          alignItems: "center",
          padding: "40px 0 50px 0",
          gap: "10px",
        }}
      >
        {icon}
        <Stack
          sx={{
            alignItems: "center",
          }}
        >
          <Typography
            align="center"
            sx={{
              fontWeight: 900,
              fontSize: "3rem",
              lineHeight: "1.15",
              "@media (max-width: 1100px)": {
                fontSize: "3rem",
              },
              "@media (max-width: 900px)": {
                fontSize: "2.1rem",
              },
              "@media (max-width: 650px)": {
                fontSize: "3rem",
              },
            }}
          >
            {title}
          </Typography>
          <Typography
            align="center"
            variant="caption"
            sx={{
              fontWeight: 300,
              opacity: 0.9,
              textTransform: "uppercase",
            }}
          >
            {subTitle}
          </Typography>
        </Stack>
      </Stack>
    </GradientBgImageCard>
  );
};

interface NoBalanceBlockProps {
  lang: SupportedLanguage;
}

export const NoBalanceBlock = ({ lang }: NoBalanceBlockProps) => {
  const usage = useUsage();
  const { i18n } = useLingui();
  const route = useRouter();
  const payWall = usePayWall();

  const urlForGame = `${getUrlStart(lang)}practice?gamePage=true`;
  const openGamePage = () => {
    route.push(urlForGame);
  };
  return (
    <CustomModal
      isOpen={true}
      onClose={() => payWall.temporaryClosePayWall()}
      padding="0"
      width="min(650px, 100dvw)"
      maxHeight={"min(100dvh, 1800px)"}
    >
      <Stack
        sx={{
          backgroundColor: "#121215",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          width: "100%",
          padding: "30px 0px",
          boxSizing: "border-box",
        }}
      >
        <Stack
          sx={{
            padding: "20px 20px 20px 30px",
            gap: "60px",
            maxWidth: "1400px",
            width: "100%",
            boxSizing: "border-box",
            position: "relative",
            zIndex: 1,
            "@media (max-width: 600px)": {
              padding: "20px 15px",
            },
          }}
        >
          <Stack sx={{ width: "100%" }}>
            <Typography
              variant="h2"
              className="decor-text"
              sx={{
                "@media (max-width: 600px)": {
                  fontSize: "1.9rem",
                },
              }}
            >
              {i18n._("Low balance")}
            </Typography>
            <Typography
              sx={{
                opacity: 0.9,
                "@media (max-width: 600px)": {
                  fontSize: "0.9rem",
                  opacity: 0.8,
                },
              }}
            >
              {i18n._("You've made amazing progress. Let’s keep going.")}
            </Typography>
          </Stack>

          <Stack sx={{ width: "100%", gap: "15px", alignItems: "flex-start" }}>
            <Stack
              sx={{
                flexDirection: "row",
                gap: "20px",
                alignItems: "center",
                "@media (max-width: 700px)": {
                  flexDirection: "column",
                  alignItems: "flex-start",
                },
              }}
            >
              <Button
                variant="contained"
                size="large"
                color="info"
                sx={{
                  padding: "15px 30px",
                }}
                onClick={() => usage.togglePaymentModal(true)}
                startIcon={<Wallet />}
              >
                {i18n._("Buy a subscription")}
              </Button>
              <Typography>or</Typography>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  padding: "15px 30px",
                }}
                onClick={() => openGamePage()}
                startIcon={<Swords />}
              >
                {i18n._("Play the Game")}
              </Button>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          sx={{
            position: "absolute",
            top: "0px",
            right: "0",
            backgroundColor: "blue",
            height: "300px",
            width: "300px",
            borderRadius: "50%",
            filter: "blur(200px)",
            zIndex: 0,
            opacity: 0.9,
          }}
        ></Stack>

        <Stack
          sx={{
            position: "absolute",
            top: "300px",
            right: "0",
            backgroundColor: "red",
            height: "300px",
            width: "300px",
            borderRadius: "50%",
            filter: "blur(200px)",
            zIndex: 0,
            opacity: 0.4,
          }}
        ></Stack>

        <Stack
          sx={{
            position: "absolute",
            top: "0px",
            left: "300px",
            backgroundColor: "cyan",
            height: "200px",
            width: "300px",
            borderRadius: "50%",
            filter: "blur(200px)",
            zIndex: 0,
            opacity: 0.61,
            "@media (max-width: 600px)": {
              left: "0px",
            },
          }}
        ></Stack>

        <Stack
          sx={{
            position: "absolute",
            top: "900px",
            left: "0",
            backgroundColor: "#5533ff",
            height: "300px",
            width: "300px",
            borderRadius: "50%",
            filter: "blur(300px)",
            zIndex: 0,
            opacity: 0.4,
          }}
        ></Stack>
      </Stack>
    </CustomModal>
  );
};
