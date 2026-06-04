import { Stack, Typography } from '@mui/material';

import { CardItemIcon } from './CardItemIcon';
import { StoreButton } from './StoreButton';
import type { CardItem } from './types';

export const StoreCardRowItem = ({
  data,
  borderRadius,
}: {
  data: CardItem;
  borderRadius?: string;
}) => {
  return (
    <Stack
      data-testid={data.testId}
      sx={{
        display: 'grid',
        gridTemplateColumns: 'min-content 1fr min-content',
        gap: '12px',
        alignItems: 'center',
        padding: '10px 20px',
        cursor: 'pointer',
        backgroundColor: data.rowBgColor || 'transparent',
        borderRadius: borderRadius,
        '@media (max-width: 600px)': {
          padding: '10px 15px',
        },
        '@media (max-width: 350px)': {
          padding: '10px 5px',
        },
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        data.onClick();
      }}
    >
      <CardItemIcon data={data} />
      <Stack>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 500,
            lineHeight: '18px',
            fontSize: '16px',
            padding: 0,
            margin: 0,
            paddingTop: '2px',
            '@media (max-width: 450px)': {
              fontSize: '14px',
            },
          }}
        >
          {data.title}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontSize: '13px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',

            wordBreak: 'break-word',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            opacity: 0.9,
            width: '420px',
            '@media (max-width: 700px)': {
              width: '300px',
            },

            '@media (max-width: 550px)': {
              width: '200px',
            },
            '@media (max-width: 450px)': {
              width: '120px',
            },
            '@media (max-width: 350px)': {
              width: '100%',
              whiteSpace: 'normal',
              height: '21px',
            },
          }}
        >
          {data.subTitle}
        </Typography>
      </Stack>
      <Stack>
        <StoreButton onClick={data.onClick} title={data.actionButtonTitle} />
      </Stack>
    </Stack>
  );
};
