import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';

export const NoMessagesPlaceholder = ({
  noMessagesPlaceholder,
}: {
  noMessagesPlaceholder?: string;
}) => {
  const { i18n } = useLingui();
  return (
    <Stack
      sx={{
        padding: '30px 20px 20px 20px',
        marginTop: '-10px',
        justifyContent: 'center',
      }}
    >
      <Typography variant="body2" sx={{ opacity: 0.7 }}>
        {noMessagesPlaceholder || i18n._('No messages yet. Be the first to share your thoughts!')}
      </Typography>
    </Stack>
  );
};
