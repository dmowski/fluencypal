import { Link, Stack, Typography } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";

import { SupportedLanguage } from "@/features/Lang/lang";
import { useLingui } from "@lingui/react";
import { useUsage } from "../Usage/useUsage";
import dayjs from "dayjs";
import { convertHoursToHumanFormat } from "@/libs/convertHoursToHumanFormat";
import { PaymentLogType } from "@/common/usage";

interface PaymentHistoryModalProps {
  onClose: () => void;
}

export const PaymentHistoryModal = ({ onClose }: PaymentHistoryModalProps) => {
  const { i18n } = useLingui();

  const usage = useUsage();

  const paymentTypeLabelMap: Record<PaymentLogType, string> = {
    welcome: i18n._(`Trial balance`),
    user: i18n._(`Payment`),
    gift: i18n._(`Gift`),
    "subscription-full-v1": i18n._(`Subscription (1 month)`),
    "trial-days": i18n._(`Trial days`),
  };

  return (
    <CustomModal isOpen={true} onClose={() => onClose()} width="100dvw" padding="0">
      <Stack
        sx={{
          gap: "30px",
          padding: "30px",
          height: "100dvh",
          maxHeight: "100dvh",
          boxSizing: "border-box",
        }}
      >
        <Typography variant="h4" component="h2">
          {i18n._(`Payment History`)}
        </Typography>

        <Stack
          sx={{
            gap: "10px",
            width: "100%",
          }}
        >
          {!usage.paymentLogs && (
            <Typography
              variant="caption"
              sx={{
                color: "#999",
              }}
            >
              {i18n._(`Loading...`)}
            </Typography>
          )}

          {usage.paymentLogs && usage.paymentLogs.length === 0 && (
            <Typography
              variant="caption"
              sx={{
                color: "#999",
              }}
            >
              {i18n._(`No payments...`)}
            </Typography>
          )}

          {usage.paymentLogs && (
            <Stack
              sx={{
                width: "100%",
                gap: "10px",
              }}
            >
              {usage.paymentLogs
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((log) => {
                  const humanDate = dayjs(log.createdAt).format("DD MMM YYYY");
                  const humanTime = dayjs(log.createdAt).format("HH:mm");
                  return (
                    <Stack
                      key={log.id}
                      sx={{
                        padding: "10px 15px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "row",
                        width: "400px",
                        maxWidth: "100%",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderRadius: "10px",
                        border: `1px solid rgba(255, 255, 255, 0.3)`,
                        "@media (max-width: 320px)": {
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "20px",
                        },
                      }}
                    >
                      <Stack>
                        <Typography variant="h6">
                          {log.currency.toUpperCase()} {log.amountAdded}
                        </Typography>

                        {!!log.amountOfHours && (
                          <Typography variant="body2">
                            {convertHoursToHumanFormat(log.amountOfHours)}
                          </Typography>
                        )}
                        {!!log.amountOfDays && (
                          <Typography variant="body2">{log.amountOfDays} days</Typography>
                        )}
                        {!!log.amountOfMonth && (
                          <Typography variant="body2">{log.amountOfMonth} months</Typography>
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                          }}
                        >
                          {paymentTypeLabelMap[log.type]}
                        </Typography>
                      </Stack>

                      <Stack
                        sx={{
                          alignItems: "flex-end",
                          "@media (max-width: 320px)": {
                            alignItems: "flex-start",
                          },
                        }}
                      >
                        <Typography variant="caption">{humanTime}</Typography>
                        <Typography variant="body2">{humanDate}</Typography>
                        {log.receiptUrl && (
                          <Link href={log.receiptUrl} target="_blank">
                            <Typography variant="body2">Receipt</Typography>
                          </Link>
                        )}
                      </Stack>
                    </Stack>
                  );
                })}
            </Stack>
          )}
        </Stack>
      </Stack>
    </CustomModal>
  );
};
