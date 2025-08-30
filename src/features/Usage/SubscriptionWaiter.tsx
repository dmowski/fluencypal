import { useLingui } from "@lingui/react";
import { Button, Stack, Typography } from "@mui/material";
import { useUsage } from "./useUsage";
import { useEffect, useState } from "react";
import { CheckCheck, Landmark } from "lucide-react";

export const SubscriptionWaiter = ({ onClose }: { onClose: () => void }) => {
  const { i18n } = useLingui();
  const usage = useUsage();
  const [isChanged, setIsChanged] = useState(false);
  const [isInitDataActivated, setIsInitDataActivated] = useState(false);
  const [initActiveTill, setInitActiveTill] = useState<string | null>(null);

  console.log("🚀 usage.activeSubscriptionTill", usage.activeSubscriptionTill);
  useEffect(() => {
    if (!isInitDataActivated) {
      setInitActiveTill(usage.activeSubscriptionTill || null);
      setIsInitDataActivated(true);
      return;
    }

    if (initActiveTill !== (usage.activeSubscriptionTill || null)) {
      setIsChanged(true);
      return;
    }
  }, [usage.activeSubscriptionTill]);

  return (
    <Stack
      sx={{
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%",
        minHeight: "100dvh",
        maxWidth: "100dvw",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {isChanged ? (
        <Stack sx={{ alignItems: "center", gap: "20px" }}>
          <CheckCheck size={"40px"} color="#4caf50" />
          <Stack sx={{ alignItems: "center", gap: "0px" }}>
            <Typography variant="h6" align="center">
              {i18n._(`Done`)}
            </Typography>
            <Typography
              align="center"
              variant="caption"
              sx={{
                opacity: 0.7,
              }}
            >
              {i18n._(`Your subscription has been successfully changed.`)}
            </Typography>
          </Stack>
          <Button variant="contained" onClick={onClose}>
            {i18n._(`Close`)}
          </Button>
        </Stack>
      ) : (
        <Stack sx={{ alignItems: "center", gap: "20px" }}>
          <Landmark size={"40px"} />
          <Stack sx={{ alignItems: "center", gap: "0px" }}>
            <Typography variant="h6" align="center">
              {i18n._(`Waiting for payment...`)}
            </Typography>
            <Typography
              align="center"
              variant="caption"
              sx={{
                opacity: 0.7,
              }}
            >
              {i18n._(`Please wait while we process your payment.`)}
            </Typography>
          </Stack>
          <Button variant="text" onClick={onClose}>
            {i18n._(`Close`)}
          </Button>
        </Stack>
      )}
    </Stack>
  );
};
