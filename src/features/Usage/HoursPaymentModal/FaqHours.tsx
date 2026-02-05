import { FaqItem } from '@/features/Landing/FAQ/FaqItem';
import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';

export const FaqHours = () => {
  const { i18n } = useLingui();

  return (
    <Stack>
      <Typography variant="h6" component="h3" sx={{ marginBottom: '10px' }}>
        {i18n._('Frequently Asked Questions')}
      </Typography>

      <FaqItem
        info={{
          question: i18n._('What means "hours of AI usage"?'),
          answer: i18n._(
            'Each time you use AI features (like conversation or Role Play), it consumes a certain amount of computational power, which we measure in "hours of AI usage." This allows us to fairly allocate resources based on your activity level. I call it "AI hours" because it`s approximate time of which you will consume the AI if you will use it continuously.',
          ),
        }}
      />
      <FaqItem
        info={{
          question: i18n._('Can I get full access for free?'),
          answer: i18n._(
            'Yes. Simply play on the Community page or send messages in the community feed to earn points. The top five users will have full access as long as they remain at the top!',
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
                  'No, you purchase resources. There is no automatic renewal; you can purchase them again when you need more.',
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
  );
};
