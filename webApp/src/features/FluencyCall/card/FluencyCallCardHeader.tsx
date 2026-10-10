'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SupportedLanguage } from '@/features/Lang/lang';
import { FluencyCallLanguageSelect } from '../FluencyCallLanguageSelect';
import { narrow, token } from './styles';

export const FluencyCallCardHeader = ({
  titleId,
  languageCode,
  onLanguageChange,
  canJoin,
  paidNotice,
}: {
  titleId: string;
  languageCode: SupportedLanguage;
  onLanguageChange: (language: SupportedLanguage) => void;
  canJoin: boolean;
  paidNotice: boolean;
}) => {
  const { i18n } = useLingui();

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <Typography
          component="h2"
          id={titleId}
          sx={{
            margin: 0,
            color: token.text,
            fontSize: '23px',
            lineHeight: 1.3,
            fontWeight: 650,
            letterSpacing: '-0.5px',
            minWidth: 0,
            overflowWrap: 'anywhere',
            [narrow]: { fontSize: '21px' },
          }}
        >
          {i18n._('Group conversations')}
        </Typography>
        <FluencyCallLanguageSelect
          value={languageCode}
          onChange={onLanguageChange}
          testId="fluency-call-language-filter"
          collapseLabel
          appearance="quiet"
        />
      </Stack>

      <Typography sx={{ margin: '6px 0', color: token.muted }}>
        {i18n._('A short practice. A few friendly people.')}
      </Typography>

      {paidNotice ? (
        <Typography data-testid="fluency-call-paid" sx={{ color: '#7DDEAA', fontWeight: 700 }}>
          {canJoin
            ? i18n._('Payment received. You can join the group conversations.')
            : i18n._('Payment received. You can join in a moment.')}
        </Typography>
      ) : null}
    </>
  );
};
