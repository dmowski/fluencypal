import { Button, Link, Stack, TextField, Typography } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";

import { useLingui } from "@lingui/react";
import { useUsage } from "../Usage/useUsage";
import dayjs from "dayjs";
import { convertHoursToHumanFormat } from "@/libs/convertHoursToHumanFormat";
import { PaymentLogType } from "@/common/usage";
import { useState } from "react";
import { BanknoteX } from "lucide-react";
import { sendFeedbackMessageRequest } from "@/app/api/telegram/sendFeedbackMessageRequest";
import { useAuth } from "../Auth/useAuth";

interface PaymentHistoryModalProps {
  onClose: () => void;
}

export const PaymentHistoryModal = ({ onClose }: PaymentHistoryModalProps) => {
  const { i18n } = useLingui();

  const usage = useUsage();
  const auth = useAuth();

  const [isShowRefund, setIsShowRefund] = useState(false);

  const paymentTypeLabelMap: Record<PaymentLogType, string> = {
    welcome: i18n._(`Trial balance`),
    user: i18n._(`Payment`),
    gift: i18n._(`Gift`),
    "subscription-full-v1": i18n._(`Subscription (1 month)`),
    "trial-days": i18n._(`Trial days`),
  };

  const [refundMessage, setRefundMessage] = useState(
    "I would like to request a refund for my recent payment.",
  );

  const [isRefundSubmitting, setIsRefundSubmitting] = useState(false);

  const onSubmitRefundRequest = async () => {
    setIsRefundSubmitting(true);
    sendFeedbackMessageRequest(
      { message: "REFUND: " + refundMessage },
      await auth.getToken(),
    );
    setIsShowRefund(false);
    alert(
      i18n._(
        `Your refund request has been submitted. We will get back to you soon.`,
      ),
    );
    setIsRefundSubmitting(false);
  };

  return (
    <CustomModal isOpen={true} onClose={() => onClose()}>
      <Stack
        sx={{
          gap: "30px",
          width: "100%",
          maxWidth: "600px",
        }}
      >
        <Stack>
          <Typography variant="h5" component="h2" align="center">
            {i18n._(`Payment History`)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.8,
            }}
            align="center"
          >
            {i18n._(`View your payment history`)}
          </Typography>
        </Stack>

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
                .filter((log) => {
                  const isTrial =
                    log.type === "trial-days" || log.type === "welcome";
                  return !isTrial;
                })
                .map((log) => {
                  const humanDate = dayjs(log.createdAt).format("DD MMM YYYY");
                  const humanTime = dayjs(log.createdAt).format("HH:mm");
                  const isTrial =
                    log.type === "trial-days" || log.type === "welcome";

                  return (
                    <Stack
                      key={log.id}
                      sx={{
                        padding: "10px 15px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
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
                        {!isTrial && (
                          <Typography variant="h6">
                            {log.currency.toUpperCase()} {log.amountAdded}
                          </Typography>
                        )}

                        {!!log.amountOfHours && (
                          <Typography variant="body2">
                            {convertHoursToHumanFormat(log.amountOfHours)}
                          </Typography>
                        )}
                        {!!log.amountOfDays && (
                          <Typography variant="body2">
                            {log.amountOfDays} days
                          </Typography>
                        )}
                        {!!log.amountOfMonth && (
                          <Typography variant="body2">
                            {log.amountOfMonth} months
                          </Typography>
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

          {isShowRefund ? (
            <Stack
              sx={{
                marginTop: "20px",
                paddingTop: "20px",
                padding: "30px 15px",
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                gap: "10px",
              }}
            >
              <Stack>
                <Typography variant="h4" sx={{ marginBottom: "10px" }}>
                  {i18n._(`Refund form`)}
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: "10px" }}>
                  {i18n._(
                    `You can add some details regarding your refund request below:`,
                  )}
                </Typography>
              </Stack>

              <TextField
                value={refundMessage}
                onChange={(e) => setRefundMessage(e.target.value)}
                multiline
                rows={4}
                fullWidth
              />
              <Stack
                sx={{
                  marginTop: "10px",
                  gap: "10px",
                  flexDirection: "row",
                }}
              >
                <Button
                  variant="contained"
                  disabled={isRefundSubmitting}
                  onClick={onSubmitRefundRequest}
                >
                  {i18n._(`Submit Request`)}
                </Button>
                <Button
                  variant="outlined"
                  disabled={isRefundSubmitting}
                  onClick={() => setIsShowRefund(false)}
                >
                  {i18n._(`Cancel`)}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <>
              <Stack
                sx={{
                  alignItems: "center",
                  width: "100%",
                  flexDirection: "row",
                  paddingTop: "20px",
                }}
              >
                <Button
                  variant="outlined"
                  disabled={
                    usage.paymentLogs?.length === 0 || isRefundSubmitting
                  }
                  startIcon={<BanknoteX />}
                  onClick={() => setIsShowRefund(true)}
                >
                  {i18n._(`Request Refund`)}
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Stack>
    </CustomModal>
  );
};
