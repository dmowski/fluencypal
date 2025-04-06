import { Button, Stack, Typography } from "@mui/material";
import { useUsage } from "./useUsage";
import {
  ChartNoAxesCombined,
  Flag,
  GraduationCap,
  MoveRight,
  Telescope,
  VenetianMask,
  Wallet,
} from "lucide-react";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { JSX } from "react";
import { ContactList } from "../Landing/Contact/ContactList";

import { UsageStatsCards } from "./UsageStatsCards";
import { useLingui } from "@lingui/react";
import { GradientBgCard, GradientBgImageCard } from "../uiKit/Card/GradientBgCard";

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
              lineHeight: "1",
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

export const NoBalanceBlock = () => {
  const usage = useUsage();
  const { i18n } = useLingui();
  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#121215",
        gap: "40px",
        //borderTop: "1px solid rgba(255, 255, 255, 0.11)",
        padding: "130px 0px",
        boxSizing: "border-box",
      }}
    >
      <Stack
        sx={{
          padding: "20px 20px 20px 30px",
          gap: "90px",
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
            {i18n._("Level up your Language!")}
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

        <UsageStatsCards />

        <Stack sx={{ width: "100%", gap: "15px" }}>
          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: "50px 1fr",
              alignItems: "center",
              gap: "15px",
              paddingBottom: "10px",
            }}
          >
            <Stack
              sx={{
                borderRadius: "50%",
                background: "linear-gradient(45deg,rgb(25, 78, 142) 0%,rgb(109, 209, 151) 100%)",
                height: "50px",
                width: "50px",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <GraduationCap size={"25px"} />
            </Stack>
            <Typography variant="h6">{i18n._(`Unlock full access to FluencyPal`)}</Typography>
          </Stack>

          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
              "@media (max-width: 700px)": {
                gridTemplateColumns: "1fr",
              },
            }}
          >
            <WinCard
              onClick={() => usage.togglePaymentModal(true)}
              title={i18n._("TALK")}
              subTitle={i18n._("Conversations with AI")}
              icon={
                <PsychologyIcon
                  style={{
                    width: "90px",
                    height: "90px",
                    fontSize: "90px",
                    color: "#fff",
                  }}
                />
              }
              src={"/blur/1.jpg"}
            />

            <WinCard
              onClick={() => usage.togglePaymentModal(true)}
              title={i18n._("PLAY")}
              subTitle={i18n._("Role-play simulations")}
              icon={
                <VenetianMask
                  style={{
                    width: "90px",
                    height: "90px",
                    fontSize: "90px",
                    color: "#fff",
                  }}
                />
              }
              src={"/blur/2.jpg"}
            />

            <WinCard
              onClick={() => usage.togglePaymentModal(true)}
              title={i18n._("ITERATE")}
              subTitle={i18n._("Feedback on your progress")}
              icon={
                <ChartNoAxesCombined
                  style={{
                    width: "90px",
                    height: "90px",
                    fontSize: "90px",
                    color: "#fff",
                  }}
                />
              }
              src={"/blur/3.jpg"}
            />
          </Stack>
        </Stack>

        <Stack sx={{ width: "100%", gap: "15px", alignItems: "flex-start" }}>
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "15px",
              paddingBottom: "10px",
            }}
          >
            <Stack
              sx={{
                borderRadius: "50%",
                background: "linear-gradient(45deg,rgb(25, 78, 142) 0%,rgb(202, 109, 209) 100%)",
                height: "50px",
                width: "50px",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Telescope size={"25px"} />
            </Stack>
            <Typography variant="h6">{i18n._(`Ready to keep going?`)}</Typography>
          </Stack>

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
            {i18n._("Buy More AI Hours")}
          </Button>
        </Stack>

        <Stack sx={{ width: "100%", gap: "15px", alignItems: "flex-start" }}>
          <Typography variant="h6">
            {i18n._("Get free AI time by helping us improve FluencyPal")}
          </Typography>
          <Stack gap={"20px"}>
            <Typography variant="body2">
              {i18n._(
                "Send us your feedback about the app — what you liked, what we can improve — and get up to 2 hours of free AI time."
              )}
            </Typography>

            <ContactList />
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
  );
};
