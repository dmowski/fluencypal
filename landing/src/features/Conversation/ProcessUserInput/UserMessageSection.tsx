import { Stack, Typography } from '@mui/material';
import { StringDiff } from 'react-string-diff';

export const UserMessageSection = ({
  label,
  message,
  isTranscribing,
  fontSize,
  transcribingLabel,
}: {
  label: string;
  message: string;
  isTranscribing: boolean;
  fontSize: string;
  transcribingLabel: string;
}) => {
  const displayedMessage = isTranscribing ? transcribingLabel : message || '';

  return (
    <Stack>
      <Typography
        variant="caption"
        sx={{
          opacity: 0.7,
          fontWeight: 350,
        }}
      >
        {label}
      </Typography>
      <Stack
        sx={{
          width: '100%',
          gap: '12px',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="body2"
          component={'div'}
          className={isTranscribing ? 'loading-shimmer' : ''}
          sx={{
            fontWeight: 400,
            fontSize: fontSize,
            paddingBottom: '3px',
            opacity: isTranscribing ? 0.7 : 0.9,
          }}
        >
          <StringDiff oldValue={displayedMessage} newValue={displayedMessage} />
        </Typography>
      </Stack>
    </Stack>
  );
};
