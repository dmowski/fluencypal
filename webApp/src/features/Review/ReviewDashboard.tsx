import { useLingui } from '@lingui/react';
import { Button, Stack, SvgIcon, Typography } from '@mui/material';
import { Avatar } from '../User/Avatar';

const TrustpilotIcon = () => (
  <SvgIcon viewBox="0 0 24 24">
    <path d="M12,17.964l5.214-1.321l2.179,6.714L12,17.964z M24,9.286h-9.179L12,0.643L9.179,9.286 H0l7.429,5.357l-2.821,8.643l7.429-5.357l4.571-3.286L24,9.286L24,9.286L24,9.286L24,9.286z" />
  </SvgIcon>
);

export const ReviewDashboard = () => {
  const { i18n } = useLingui();
  const founderAvatarUrl =
    'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1770557197628-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.jpg';
  return (
    <Stack
      sx={{
        alignItems: 'flex-end',
        paddingTop: '20px',
      }}
    >
      <Stack
        sx={{
          width: '100%',
          height: '1px',
          backgroundColor: 'divider',
          marginBottom: '25px',
        }}
      />
      <Stack
        sx={{
          flexDirection: 'row',
          width: '100%',
          gap: '15px',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}
      >
        <Avatar url={founderAvatarUrl} avatarSize="40px" />
        <Stack>
          <Typography
            sx={{
              background: 'linear-gradient(45deg, #424242 0%, #3c3c3c 100%)',
              borderRadius: '10px',
              padding: '10px 14px',
              color: 'white',
              fontWeight: 400,
              fontSize: '18px',
              textAlign: 'balance',
            }}
          >
            {i18n._(
              `Hi. My name is Alex. I'm the creator of FluencyPal. If you've used FluencyPal, I'd appreciate your honest review on Trustpilot. Your feedback helps me improve the product and helps other learners understand what to expect. Please share your real-life experiences, whether positive, negative, or mixed.`,
            )}
          </Typography>
        </Stack>
      </Stack>
      <Button
        variant="contained"
        color="info"
        href="https://www.trustpilot.com/review/www.fluencypal.com"
        target="_blank"
        startIcon={<TrustpilotIcon />}
        sx={{
          marginTop: '15px',
          color: 'white',
          backgroundColor: '#00b67a',
        }}
      >
        {i18n._('Write a review on Trustpilot')}
      </Button>
    </Stack>
  );
};
