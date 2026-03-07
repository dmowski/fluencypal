import { FaqItem } from '@/features/Landing/FAQ/FaqItem';
import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';

export const FaqSubscription = () => {
  const { i18n } = useLingui();
  return (
    <Stack gap="10px">
      <Typography variant="h6" component="h3" sx={{ marginBottom: '10px', fontWeight: 400 }}>
        {i18n._('Frequently Asked Questions')}
      </Typography>

      <Stack
        sx={{
          maxWidth: '700px',
        }}
      >
        <FaqItem
          info={{
            question: i18n._('Call duration limits?'),
            answer: (
              <Stack
                sx={{
                  gap: '10px',
                }}
              >
                <Typography>
                  {i18n._(
                    'No, there are no call duration limits. You can talk as long as you want during the selected time period.',
                  )}
                </Typography>
              </Stack>
            ),
          }}
        />

        <FaqItem
          info={{
            question: i18n._('Is this a subscription?'),
            answer: (
              <Stack
                sx={{
                  gap: '10px',
                }}
              >
                <Typography>
                  {i18n._(
                    'No, you are purchasing full access for a selected period of time. There is no auto-renewal, you can buy full access again when your current period ends.',
                  )}
                </Typography>
              </Stack>
            ),
          }}
        />

        <FaqItem
          info={{
            question: i18n._('Daily Limits?'),
            answer: (
              <Stack
                sx={{
                  gap: '10px',
                }}
              >
                <Typography>
                  {i18n._(
                    'No, there are no daily limits. You can talk as many times as you want during the selected time period.',
                  )}
                </Typography>
              </Stack>
            ),
          }}
        />

        <FaqItem
          info={{
            question: i18n._('Can I use it on smartphone?'),
            answer: (
              <Stack
                sx={{
                  gap: '10px',
                }}
              >
                <Typography>
                  {i18n._(
                    'Yes, you can use it on your smartphone. The service is fully accessible from mobile devices. Simply open the website in your mobile browser and log in to your account.',
                  )}
                </Typography>
              </Stack>
            ),
          }}
        />

        <FaqItem
          info={{
            question: i18n._('Can I do a refund after purchase?'),
            answer: i18n._(
              'Yes. If you are not satisfied with the service, you can request a refund on the Profile/Payment History page, and we will process it.',
            ),
          }}
        />
      </Stack>
    </Stack>
  );
};
