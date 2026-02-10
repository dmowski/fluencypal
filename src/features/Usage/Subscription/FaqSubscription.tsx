import { FaqItem } from '@/features/Landing/FAQ/FaqItem';
import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';

export const FaqSubscription = () => {
  const { i18n } = useLingui();
  return (
    <Stack gap="10px">
      <Typography variant="h4" component="h3" sx={{ marginBottom: '10px', fontWeight: 800 }}>
        {i18n._('Frequently Asked Questions')}
      </Typography>

      <Stack
        sx={{
          maxWidth: '700px',
        }}
      >
        <FaqItem
          info={{
            question: i18n._('Can I get full access for free?'),
            answer: i18n._(
              'Yes. Simply play on the Community page or send messages in the chat to earn points. The top five users will have full access as long as they remain at the top!',
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
            question: i18n._('Can I do a refund after purchase?'),
            answer: i18n._(
              'Yes. If you\'re not satisfied with the service, on "Profile/Payment history" page you can request a refund and we will discuss the details.',
            ),
          }}
        />
      </Stack>
    </Stack>
  );
};
