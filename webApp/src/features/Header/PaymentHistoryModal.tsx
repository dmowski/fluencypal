import { Button, Link, Stack, Typography } from '@mui/material';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useLingui } from '@lingui/react';
import { useUsage } from '../Usage/useUsage';
import dayjs from 'dayjs';
import { convertHoursToHumanFormat } from '@/libs/convertHoursToHumanFormat';
import { PaymentLog, PaymentLogType } from '@/features/Usage/usage';
import { useMemo, useState } from 'react';
import { BanknoteX } from 'lucide-react';
import { SupportPage } from '../Community/SupportPage';
import { isWithdrawablePayment } from '@/features/Usage/getPaymentContractSubject';
import { WithdrawFromContractModal } from './WithdrawFromContractModal';

interface PaymentHistoryModalProps {
  onClose: () => void;
}

export const PaymentHistoryModal = ({ onClose }: PaymentHistoryModalProps) => {
  const { i18n } = useLingui();
  const usage = useUsage();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const paymentTypeLabelMap: Record<PaymentLogType, string> = {
    welcome: i18n._(`Trial balance`),
    user: i18n._(`Payment`),
    gift: i18n._(`Gift`),
    'subscription-full-v1': i18n._(`Subscription (1 month)`),
    'trial-days': i18n._(`Trial days`),
    'advanced-hours': i18n._(`Advanced AI hours`),
  };

  const paidLogs = useMemo(() => {
    if (!usage.paymentLogs) {
      return [];
    }
    return usage.paymentLogs
      .filter((log) => log.type !== 'trial-days' && log.type !== 'welcome')
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [usage.paymentLogs]);

  const withdrawableLogs = useMemo(
    () => paidLogs.filter((log) => isWithdrawablePayment(log)),
    [paidLogs],
  );

  const renderPaymentRow = (log: PaymentLog) => {
    const humanDate = dayjs(log.createdAt).format('DD MMM YYYY');
    const humanTime = dayjs(log.createdAt).format('HH:mm');
    const isWithdrawn = !!log.withdrawnAtIso;

    return (
      <Stack
        key={log.id}
        sx={{
          padding: '10px 15px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          maxWidth: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '10px',
          border: `1px solid rgba(255, 255, 255, 0.3)`,
          opacity: isWithdrawn ? 0.6 : 1,
          '@media (max-width: 320px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '20px',
          },
        }}
      >
        <Stack>
          <Typography variant="h6">
            {log.currency.toUpperCase()} {log.amountAdded}
          </Typography>

          {!!log.amountOfHours && (
            <Typography variant="body2">{convertHoursToHumanFormat(log.amountOfHours)}</Typography>
          )}
          {!!log.amountOfDays && <Typography variant="body2">{log.amountOfDays} days</Typography>}
          {!!log.amountOfMonth && (
            <Typography variant="body2">{log.amountOfMonth} months</Typography>
          )}
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {paymentTypeLabelMap[log.type]}
          </Typography>
          {isWithdrawn && (
            <Typography variant="caption" sx={{ color: '#8bc34a', marginTop: '4px' }}>
              {i18n._(`Withdrawn`)}
            </Typography>
          )}
        </Stack>

        <Stack
          sx={{
            alignItems: 'flex-end',
            '@media (max-width: 320px)': {
              alignItems: 'flex-start',
            },
          }}
        >
          <Typography variant="caption">{humanTime}</Typography>
          <Typography variant="body2">{humanDate}</Typography>
          {log.receiptUrl && (
            <Link href={log.receiptUrl} target="_blank">
              <Typography variant="body2">{i18n._(`Receipt`)}</Typography>
            </Link>
          )}
        </Stack>
      </Stack>
    );
  };

  return (
    <>
      <CustomModal isOpen={true} onClose={onClose}>
        <Stack sx={{ gap: '30px', width: '100%', maxWidth: '600px' }}>
          <Stack>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              {i18n._(`Payment History`)}
            </Typography>
            <Typography variant="caption">{i18n._(`View your payment history`)}</Typography>
          </Stack>

          <Stack sx={{ gap: '10px', width: '100%' }}>
            {!usage.paymentLogs && (
              <Typography variant="caption" sx={{ color: '#999' }}>
                {i18n._(`Loading...`)}
              </Typography>
            )}

            {usage.paymentLogs && paidLogs.length === 0 && (
              <Typography variant="caption" sx={{ color: '#999' }}>
                {i18n._(`No payments...`)}
              </Typography>
            )}

            {usage.paymentLogs && paidLogs.length > 0 && (
              <Stack sx={{ width: '100%', gap: '10px' }}>{paidLogs.map(renderPaymentRow)}</Stack>
            )}

            <Stack sx={{ alignItems: 'center', width: '100%', paddingTop: '20px' }}>
              <Button
                variant="outlined"
                disabled={withdrawableLogs.length === 0}
                startIcon={<BanknoteX />}
                onClick={() => setIsWithdrawModalOpen(true)}
              >
                {i18n._(`Withdraw from contract here`)}
              </Button>
              <Typography
                variant="caption"
                sx={{ marginTop: '10px', opacity: 0.7, textAlign: 'center' }}
              >
                {i18n._(
                  `You may also withdraw by email at contact@fluencypal.com or in writing to our registered address listed in the Terms and Conditions.`,
                )}
              </Typography>
            </Stack>
          </Stack>

          <Stack sx={{ gap: '20px' }}>
            <SupportPage />
          </Stack>
        </Stack>
      </CustomModal>

      {isWithdrawModalOpen && (
        <WithdrawFromContractModal onClose={() => setIsWithdrawModalOpen(false)} />
      )}
    </>
  );
};
