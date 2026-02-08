'use client';
import { Button, Stack } from '@mui/material';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useState } from 'react';
import { useAuth } from '../../Auth/useAuth';
import { beginCell } from '@ton/core';
import { useLingui } from '@lingui/react';
import {
  TonConnectButton,
  useTonWallet,
  SendTransactionRequest,
  useTonConnectUI,
  CHAIN,
} from '@tonconnect/ui-react';
import { TonIcon } from '../../Icon/TonIcon';
import { sendCreateCryptoOrderRequest } from '@/app/api/crypto/createOrder/sendCreateCryptoOrderRequest';

export const TgWalletButton = ({
  onShowWaiter,
  onPressPay,
}: {
  onShowWaiter: () => void;
  onPressPay: () => void;
}) => {
  const wallet = useTonWallet();
  const auth = useAuth();
  const notifications = useNotifications();
  const { i18n } = useLingui();
  const [isLoading, setIsLoading] = useState(false);
  const [tonConnectUI] = useTonConnectUI();

  const payWithTon = async () => {
    if (!wallet) {
      return;
    }

    setIsLoading(true);

    try {
      onPressPay();
      const order = await sendCreateCryptoOrderRequest(
        {
          monthCount: 1,
        },
        await auth.getToken(),
      );

      if (order.error) {
        console.log('error during payment', order);
        notifications.show(i18n._('Error creating payment session') + ' - ' + order.error.message, {
          severity: 'error',
        });
        setIsLoading(false);
        return;
      }

      const { merchantAddress, amountNano, comment } = order;

      function makeCommentPayloadBase64(comment: string) {
        const cell = beginCell()
          .storeUint(0, 32) // op = 0 for text comment
          .storeStringTail(comment) // UTF-8 text
          .endCell();
        return cell.toBoc().toString('base64');
      }

      if (!merchantAddress || !amountNano || !comment) {
        console.log('error during payment', order);
        notifications.show(i18n._('Error creating payment session'), {
          severity: 'error',
        });
        setIsLoading(false);
        return;
      }

      const payloadB64 = makeCommentPayloadBase64(comment);

      const validUntil = Math.floor(Date.now() / 1000) + 300; // 5 min
      const tx: SendTransactionRequest = {
        validUntil,
        network: wallet?.account?.chain ?? CHAIN.MAINNET,
        messages: [
          {
            address: merchantAddress,
            amount: amountNano,
            payload: payloadB64,
          },
        ],
      };

      const transactionEvent = await tonConnectUI.sendTransaction(tx);
      console.log('transactionEvent FINISHED', transactionEvent);
      onShowWaiter();
    } catch (e) {
      console.log('CRYPTO ERROR', e);
      notifications.show(i18n._('Error processing payment'), {
        severity: 'error',
      });
    }

    setIsLoading(false);
  };

  return (
    <Stack
      sx={{
        alignItems: 'center',
        gap: '5px',
        width: '100%',
      }}
    >
      <TonConnectButton />

      {wallet && (
        <Button
          variant="outlined"
          color="info"
          disabled={isLoading}
          onClick={payWithTon}
          fullWidth
          size="large"
          startIcon={<TonIcon size="20px" />}
        >
          {isLoading ? i18n._('Loading...') : i18n._('Pay with crypto')}
        </Button>
      )}
    </Stack>
  );
};
