'use client';

import { IconButton, Stack, Typography } from '@mui/material';
import { Book } from './types';
import { useLingui } from '@lingui/react';
import { CirclePlus, Trash2 } from 'lucide-react';

export const BookCard = ({
  data,
  onClick,
  onDelete,
}: {
  data: Book;
  onClick: (data: Book) => void;
  onDelete?: (data: Book) => void;
}) => {
  return (
    <Stack
      onClick={() => onClick(data)}
      sx={{
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        cursor: 'pointer',
        color: '#fff',
        gap: '4px',
      }}
    >
      {onDelete && (
        <Stack sx={{ width: '100%', alignItems: 'flex-end' }}>
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(data);
            }}
            sx={{
              color: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
              },
            }}
          >
            <Trash2 size={'16px'} />
          </IconButton>
        </Stack>
      )}
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
