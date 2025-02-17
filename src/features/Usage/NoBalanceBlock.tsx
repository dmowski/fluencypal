import { Button, Stack, Typography } from "@mui/material";
import { useUsage } from "./useUsage";
import { StarContainer } from "../Layout/StarContainer";
import { HandCoins, Wallet } from "lucide-react";

export const NoBalanceBlock = () => {
  const usage = useUsage();

  return (
    <Stack
      sx={{
        height: "calc(100vh - 0px)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <StarContainer>
        <Stack
          sx={{
            alignItems: "center",
            gap: "20px",
          }}
        >
          <HandCoins
            size={"90px"}
            strokeWidth={"1px"}
            style={{
              opacity: 0.9,
            }}
          />
          <Stack
            sx={{
              alignItems: "center",
            }}
          >
            <Typography align="center" variant="h5">
              You have used all your balance
            </Typography>
            <Typography
              align="center"
              variant="caption"
              sx={{
                opacity: 0.9,
              }}
            >
              Please add more balance to continue
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          size="large"
          onClick={() => usage.setIsShowPaymentModal(true)}
          startIcon={<Wallet />}
        >
          Buy more
        </Button>
      </StarContainer>
    </Stack>
  );
};
