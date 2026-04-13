import { Stack, Typography } from '@mui/material';
import { StringDiff } from 'react-string-diff';

type CorrectedMessageSectionProps = {
  label: string;
  isTranscribing: boolean;
  isAnalyzing: boolean;
  translatedCorrectedMessage: string | null;
  correctedMessage: string | null;
  userMessage: string;
  messagesFontSize: string;
  transcribingLabel: string;
  analyzingLabel: string;
};

export const CorrectedMessageSection = ({
  label,
  isTranscribing,
  isAnalyzing,
  translatedCorrectedMessage,
  correctedMessage,
  userMessage,
  messagesFontSize,
  transcribingLabel,
  analyzingLabel,
}: CorrectedMessageSectionProps) => {
  const baseText = translatedCorrectedMessage
    ? translatedCorrectedMessage
    : isTranscribing
      ? transcribingLabel
      : isAnalyzing
        ? analyzingLabel
        : userMessage || '';

  const correctedText = translatedCorrectedMessage
    ? translatedCorrectedMessage
    : isTranscribing
      ? transcribingLabel
      : isAnalyzing
        ? analyzingLabel
        : correctedMessage || userMessage || '';

  const isLoading = isTranscribing || isAnalyzing;

  return (
    <Stack
      sx={{
        paddingTop: '15px',
      }}
    >
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
          className={isLoading ? 'loading-shimmer' : ''}
          sx={{
            fontWeight: 400,
            fontSize: messagesFontSize,
            paddingBottom: '3px',
            opacity: isLoading ? 0.7 : 0.9,
          }}
        >
          <StringDiff
            styles={{
              added: {
                color: '#81e381',
                fontWeight: 600,
              },
              removed: {
                display: 'none',
                textDecoration: 'line-through',
                opacity: 0.4,
              },
              default: {},
            }}
            oldValue={baseText}
            newValue={correctedText}
          />
        </Typography>
      </Stack>
    </Stack>
  );
};
