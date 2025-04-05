import { Button, Stack, Typography } from "@mui/material";
import { useUsage } from "./useUsage";
import { ChartNoAxesCombined, VenetianMask, Wallet } from "lucide-react";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { JSX } from "react";
import { ContactList } from "../Landing/Contact/ContactList";

import { UsageStatsCards } from "./UsageStatsCards";
import { useLingui } from "@lingui/react";

const WinCard = ({ title, icon }: { title: string; icon: JSX.Element }) => {
  return (
    <Stack
      sx={{
        backgroundColor: "rgba(30, 30, 30, 0.6)",
        padding: "40px 20px",
        borderRadius: "10px",
        gap: "15px",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Stack>{icon}</Stack>
      <Typography
        align="center"
        sx={{
          fontWeight: 300,
          opacity: 0.9,
        }}
      >
        {title}
      </Typography>
    </Stack>
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
          <Typography variant="h6">{i18n._("Unlock full access to FluencyPal")}</Typography>
          <Stack
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
              "@media (max-width: 600px)": {
                gridTemplateColumns: "1fr",
              },
            }}
          >
            <WinCard
              icon={
                <PsychologyIcon
                  sx={{
                    fontSize: "50px",
                  }}
                />
              }
              title={i18n._("Conversations with AI")}
            />
            <WinCard icon={<VenetianMask size={50} />} title={i18n._("Role-play simulations")} />
            <WinCard
              icon={<ChartNoAxesCombined size={50} />}
              title={i18n._("Daily tasks and progress tracking")}
            />
          </Stack>
        </Stack>

        <Stack sx={{ width: "100%", gap: "15px", alignItems: "flex-start" }}>
          <Typography variant="h6">{i18n._("Ready to keep going?")}</Typography>
          <Button
            variant="contained"
            size="large"
            color="info"
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
