import { Button, Stack, Typography } from "@mui/material";
import { CustomModal } from "../Modal/CustomModal";
import { useUsage } from "./useUsage";
import { useNotifications } from "@toolpad/core/useNotifications";
import AddCardIcon from "@mui/icons-material/AddCard";

export const PaymentModal = () => {
  const usage = useUsage();
  const notifications = useNotifications();

  if (!usage.isShowPaymentModal) return null;

  return (
    <CustomModal isOpen={true} onClose={() => usage.setIsShowPaymentModal(false)} width="400px">
      <Typography id="modal-modal-title" variant="h4" component="h2">
        Balance
      </Typography>
      <Stack
        sx={{
          width: "100%",
          gap: "20px",
        }}
      >
        <Stack
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack>
            <Typography variant="h3">${new Intl.NumberFormat().format(usage.balance)}</Typography>
            <Typography variant="caption">Current Balance</Typography>
          </Stack>

          <Stack>
            <Typography variant="h3">
              ${new Intl.NumberFormat().format(usage.usedBalance)}
            </Typography>
            <Typography variant="caption">Total used</Typography>
          </Stack>
        </Stack>

        <Button
          onClick={() => {
            const amount = prompt("Enter amount to update", "10");
            if (!amount) {
              return;
            }

            usage.addBalance(parseFloat(amount));
            notifications.show(`Added $${amount} to your balance`, {
              severity: "success",
              autoHideDuration: 7000,
            });
          }}
          startIcon={<AddCardIcon />}
          variant="contained"
        >
          Buy More
        </Button>
      </Stack>
    </CustomModal>
  );
};
