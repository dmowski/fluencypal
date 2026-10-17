'use client';

import { Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { narrow, token } from './styles';

export const FluencyCallCardHeader = ({
  titleId,
  canJoin,
  paidNotice,
}: {
  titleId: string;
  canJoin: boolean;
  paidNotice: boolean;
}) => {
  const { i18n } = useLingui();

  return (
    <>
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

      <Typography sx={{ margin: '6px 0', color: token.muted }}>
        {i18n._('A short practice. Speak when you are ready. You can listen first.')}
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
