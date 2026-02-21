import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { ProcessStatusIcon } from './ProcessStatusIcon';

export const ProcessHeader = ({
  state,
  rate,
}: {
  state: 'loading' | 'correct' | 'incorrect';
  rate?: number | null;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '15px',
        width: '100%',
      }}
    >
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '15px',
        }}
      >
        <ProcessStatusIcon
          state={state === 'loading' ? 'loading' : state === 'incorrect' ? 'incorrect' : 'correct'}
        />
        {state === 'incorrect' ? (
          <Typography variant="h6">{i18n._('Almost correct')}</Typography>
        ) : (
          <>
            {state === 'loading' ? (
              <Typography
                className="loading-shimmer"
                sx={{
                  color: '#fff',
                  display: 'inline',
                }}
                variant="h6"
              >
                {i18n._('Analyzing...')}
              </Typography>
            ) : (
              <Typography variant="h6">{i18n._('Great!')}</Typography>
            )}
          </>
        )}
      </Stack>
      {!!rate && (
        <Typography
          variant="body2"
          sx={{
            opacity: 0.7,
          }}
        >
          {rate}/10
        </Typography>
      )}
    </Stack>
  );
};
