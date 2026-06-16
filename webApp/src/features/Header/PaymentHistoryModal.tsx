import { Button, Link, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { CustomModal } from '../uiKit/Modal/CustomModal';

import { useLingui } from '@lingui/react';
import { useUsage } from '../Usage/useUsage';
import dayjs from 'dayjs';
import { convertHoursToHumanFormat } from '@/libs/convertHoursToHumanFormat';
import { PaymentLog, PaymentLogType } from '@/features/Usage/usage';
import { useMemo, useState } from 'react';
import { BanknoteX, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../Auth/useAuth';
import { SupportPage } from '../Community/SupportPage';
import { useSettings } from '../Settings/useSettings';
import { submitWithdrawFromContract } from '@/features/Usage/submitWithdrawFromContract';
import {
  getPaymentContractSubject,
  isWithdrawablePayment,
} from '@/features/Usage/getPaymentContractSubject';

interface PaymentHistoryModalProps {
  onClose: () => void;
  openWithdrawForm?: boolean;
}

type WithdrawalStep = 'history' | 'form' | 'confirm' | 'success';

export const PaymentHistoryModal = ({ onClose, openWithdrawForm }: PaymentHistoryModalProps) => {
  const { i18n } = useLingui();
  const usage = useUsage();
  const auth = useAuth();
  const settings = useSettings();

  const [withdrawalStep, setWithdrawalStep] = useState<WithdrawalStep>(
    openWithdrawForm ? 'form' : 'history',
  );
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [optionalNote, setOptionalNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [refundProcessed, setRefundProcessed] = useState(false);

  const defaultName = auth.userInfo?.displayName || settings.userSettings?.displayName || '';
  const customerEmail = auth.userInfo?.email || settings.userSettings?.email || '';

  const paymentTypeLabelMap: Record<PaymentLogType, string> = {
    welcome: i18n._(`Trial balance`),
    user: i18n._(`Payment`),
    gift: i18n._(`Gift`),
    'subscription-full-v1': i18n._(`Subscription (1 month)`),
    'trial-days': i18n._(`Trial days`),
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

  const selectedPayment = paidLogs.find((log) => log.id === selectedPaymentId);

  const openWithdrawalForm = () => {
    setCustomerName((current) => current || defaultName);
    setSelectedPaymentId((current) => current || withdrawableLogs[0]?.id || '');
    setOptionalNote('');
    setSubmitError(null);
    setWithdrawalStep('form');
  };

  const formatPaymentLabel = (log: PaymentLog) => {
    const date = dayjs(log.createdAt).format('DD MMM YYYY');
    const subject = getPaymentContractSubject(log);
    return `${date} – ${log.currency.toUpperCase()} ${log.amountAdded} – ${subject}`;
  };

  const onConfirmWithdrawal = async () => {
    if (!selectedPayment) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const result = await submitWithdrawFromContract(
      {
        paymentId: selectedPayment.id,
        customerName: customerName.trim(),
        optionalNote: optionalNote.trim() || undefined,
      },
      await auth.getToken(),
    );

    setIsSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error || i18n._(`Something went wrong. Please try again.`));
      return;
    }

    setRefundProcessed(result.refundProcessed);
    setWithdrawalStep('success');
  };

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
          {!!log.amountOfDays && (
            <Typography variant="body2">{log.amountOfDays} days</Typography>
          )}
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

  const renderWithdrawalForm = () => (
    <Stack
      sx={{
        marginTop: '20px',
        padding: '30px 15px',
        borderRadius: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        gap: '16px',
      }}
    >
      <Stack>
        <Typography variant="h4" sx={{ marginBottom: '8px' }}>
          {i18n._(`Withdraw from contract`)}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          {i18n._(
            `Fill in the withdrawal statement below. You can withdraw from selected purchases within 14 days of purchase, or contact us anytime if you are not satisfied with the service.`,
          )}
        </Typography>
      </Stack>

      <TextField
        label={i18n._(`Full name`)}
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        fullWidth
        required
      />

      <TextField
        select
        label={i18n._(`Contract / order to withdraw from`)}
        value={selectedPaymentId}
        onChange={(e) => setSelectedPaymentId(e.target.value)}
        fullWidth
        required
        helperText={
          withdrawableLogs.length === 0
            ? i18n._(`No eligible payments available for withdrawal.`)
            : undefined
        }
      >
        {withdrawableLogs.map((log) => (
          <MenuItem key={log.id} value={log.id}>
            {formatPaymentLabel(log)}
          </MenuItem>
        ))}
      </TextField>

      {selectedPayment && (
        <Stack
          sx={{
            gap: '6px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          }}
        >
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {i18n._(`Contract details`)}
          </Typography>
          <Typography variant="body2">
            {i18n._(`Order number:`)} {selectedPayment.id}
          </Typography>
          <Typography variant="body2">
            {i18n._(`Contract date:`)}{' '}
            {dayjs(selectedPayment.createdAt).format('DD MMM YYYY HH:mm')}
          </Typography>
          <Typography variant="body2">
            {i18n._(`Subject:`)} {getPaymentContractSubject(selectedPayment)}
          </Typography>
          <Typography variant="body2">
            {i18n._(`Amount paid:`)} {selectedPayment.currency.toUpperCase()}{' '}
            {selectedPayment.amountAdded}
          </Typography>
        </Stack>
      )}

      <Typography variant="body2" sx={{ opacity: 0.85 }}>
        {i18n._(
          `Confirmation of your withdrawal will be sent by email to {email} immediately after you confirm.`,
          { email: customerEmail || i18n._(`your account email`) },
        )}
      </Typography>

      <TextField
        label={i18n._(`Additional note (optional)`)}
        value={optionalNote}
        onChange={(e) => setOptionalNote(e.target.value)}
        multiline
        rows={3}
        fullWidth
      />

      <Typography variant="body2" sx={{ opacity: 0.85 }}>
        {i18n._(
          `Once confirmed, your refund will be processed within 1–5 business days using the same payment method you used for the purchase.`,
        )}
      </Typography>

      <Stack sx={{ gap: '10px', flexDirection: 'row', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          disabled={
            isSubmitting ||
            !customerName.trim() ||
            !selectedPaymentId ||
            withdrawableLogs.length === 0
          }
          onClick={() => setWithdrawalStep('confirm')}
        >
          {i18n._(`Continue to confirmation`)}
        </Button>
        <Button
          variant="outlined"
          disabled={isSubmitting}
          onClick={() => setWithdrawalStep('history')}
        >
          {i18n._(`Cancel`)}
        </Button>
      </Stack>
    </Stack>
  );

  const renderWithdrawalConfirm = () => {
    if (!selectedPayment) {
      return null;
    }

    return (
      <Stack
        sx={{
          marginTop: '20px',
          padding: '30px 15px',
          borderRadius: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          gap: '16px',
        }}
      >
        <Typography variant="h4">{i18n._(`Confirm withdrawal from contract`)}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          {i18n._(`Please review your withdrawal statement before confirming:`)}
        </Typography>

        <Stack
          sx={{
            gap: '8px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          }}
        >
          <Typography variant="body2">
            <strong>{i18n._(`Name:`)}</strong> {customerName.trim()}
          </Typography>
          <Typography variant="body2">
            <strong>{i18n._(`Order / contract number:`)}</strong> {selectedPayment.id}
          </Typography>
          <Typography variant="body2">
            <strong>{i18n._(`Contract date:`)}</strong>{' '}
            {dayjs(selectedPayment.createdAt).format('DD MMM YYYY HH:mm')}
          </Typography>
          <Typography variant="body2">
            <strong>{i18n._(`Subject of contract:`)}</strong>{' '}
            {getPaymentContractSubject(selectedPayment)}
          </Typography>
          <Typography variant="body2">
            <strong>{i18n._(`Amount paid:`)}</strong> {selectedPayment.currency.toUpperCase()}{' '}
            {selectedPayment.amountAdded}
          </Typography>
          {optionalNote.trim() && (
            <Typography variant="body2">
              <strong>{i18n._(`Additional note:`)}</strong> {optionalNote.trim()}
            </Typography>
          )}
          <Typography variant="body2">
            <strong>{i18n._(`Confirmation will be sent to:`)}</strong> {customerEmail}
          </Typography>
        </Stack>

        {submitError && (
          <Typography variant="body2" sx={{ color: '#f24' }}>
            {submitError}
          </Typography>
        )}

        <Stack sx={{ gap: '10px', flexDirection: 'row', flexWrap: 'wrap' }}>
          <Button variant="contained" disabled={isSubmitting} onClick={onConfirmWithdrawal}>
            {i18n._(`Confirm withdrawal from contract`)}
          </Button>
          <Button
            variant="outlined"
            disabled={isSubmitting}
            onClick={() => setWithdrawalStep('form')}
          >
            {i18n._(`Back`)}
          </Button>
        </Stack>
      </Stack>
    );
  };

  const renderWithdrawalSuccess = () => (
    <Stack
      sx={{
        marginTop: '20px',
        padding: '30px 15px',
        borderRadius: '10px',
        backgroundColor: 'rgba(139, 195, 74, 0.08)',
        border: '1px solid rgba(139, 195, 74, 0.25)',
        gap: '16px',
        alignItems: 'flex-start',
      }}
    >
      <Stack sx={{ flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
        <CheckCircle2 color="#8bc34a" />
        <Typography variant="h4">{i18n._(`Withdrawal confirmed`)}</Typography>
      </Stack>
      <Typography variant="body2">
        {i18n._(
          `Your withdrawal from contract has been confirmed. A confirmation email has been sent to {email}.`,
          { email: customerEmail },
        )}
      </Typography>
      <Typography variant="body2">
        {refundProcessed
          ? i18n._(
              `Your refund has been initiated and will appear within 1–5 business days using your original payment method.`,
            )
          : i18n._(
              `Your refund request has been received and will be processed within 1–5 business days. If you do not see it by then, please contact support.`,
            )}
      </Typography>
      <Button variant="contained" onClick={() => onClose()}>
        {i18n._(`Close`)}
      </Button>
    </Stack>
  );

  return (
    <CustomModal isOpen={true} onClose={() => onClose()}>
      <Stack
        sx={{
          gap: '30px',
          width: '100%',
          maxWidth: '600px',
        }}
      >
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

          {withdrawalStep === 'history' && usage.paymentLogs && paidLogs.length > 0 && (
            <Stack sx={{ width: '100%', gap: '10px' }}>{paidLogs.map(renderPaymentRow)}</Stack>
          )}

          {withdrawalStep === 'form' && renderWithdrawalForm()}
          {withdrawalStep === 'confirm' && renderWithdrawalConfirm()}
          {withdrawalStep === 'success' && renderWithdrawalSuccess()}

          {withdrawalStep === 'history' && (
            <Stack sx={{ alignItems: 'center', width: '100%', paddingTop: '20px' }}>
              <Button
                variant="outlined"
                disabled={withdrawableLogs.length === 0 || isSubmitting}
                startIcon={<BanknoteX />}
                onClick={openWithdrawalForm}
              >
                {i18n._(`Withdraw from contract here`)}
              </Button>
              <Typography variant="caption" sx={{ marginTop: '10px', opacity: 0.7, textAlign: 'center' }}>
                {i18n._(
                  `You may also withdraw by email at contact@fluencypal.com or in writing to our registered address listed in the Terms and Conditions.`,
                )}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Stack sx={{ gap: '20px' }}>
          <SupportPage />
        </Stack>
      </Stack>
    </CustomModal>
  );
};
