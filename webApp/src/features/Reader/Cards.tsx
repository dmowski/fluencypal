'use client';

import { Stack, Typography } from '@mui/material';
import { Book } from './types';
import { useLingui } from '@lingui/react';
import { CirclePlus } from 'lucide-react';

export const BookCard = ({ data, onClick }: { data: Book; onClick: (data: Book) => void }) => {
  return (
    <Stack
      onClick={() => onClick(data)}
      sx={{
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        cursor: 'pointer',
        color: '#fff',
      }}
    >
      <Typography variant="h4">{data.title}</Typography>
      <Typography variant="subtitle1">{data.subtitle}</Typography>
      <Typography variant="body2">{data.category}</Typography>
    </Stack>
  );
};

export const AddNewBookCard = ({ onClick }: { onClick: () => void }) => {
  const i18n = useLingui();
  return (
    <Stack
      onClick={() => onClick()}
      sx={{
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        cursor: 'pointer',
        color: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
      }}
    >
      <CirclePlus size={'30px'} />
      <Typography>{i18n._('Add New Book')}</Typography>
    </Stack>
  );
};
