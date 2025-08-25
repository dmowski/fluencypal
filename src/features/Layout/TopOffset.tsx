"use client";
import { Stack } from "@mui/material";
import { useWindowSizes } from "./useWindowSizes";
import { useUsage } from "../Usage/useUsage";
import { SubscriptionPaymentModal } from "../Usage/SubscriptionPaymentModal";

export const TopOffset = () => {
  const { topOffset } = useWindowSizes();
  const usage = useUsage();

  return (
    <>
      {usage.isShowPaymentModal && <SubscriptionPaymentModal />}

      <Stack
        sx={{
          width: "100%",
          height: topOffset,
        }}
      />
    </>
  );
};
