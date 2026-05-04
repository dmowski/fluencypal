'use client';

import { IconButton, Stack, Typography } from '@mui/material';
import { Book } from '../model/types';
import { useLingui } from '@lingui/react';
import { CirclePlus, Download, Trash2 } from 'lucide-react';

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
        padding: '36px 45px 36px 36px',
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        cursor: 'pointer',
        color: '#fff',
        gap: '4px',
        position: 'relative',
      }}
    >
      {onDelete && (
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(data);
          }}
          sx={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            color: '#fff',
            //backgroundColor: 'rgba(255, 255, 255, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
            },
          }}
        >
          <Trash2 size={'16px'} />
        </IconButton>
      )}
      {data.originalFile && (
        <IconButton
          size="small"
          aria-label="Download original file"
          onClick={(event) => {
            event.stopPropagation();
            const url = URL.createObjectURL(data.originalFile!);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = data.originalFile!.name;
            anchor.click();
            URL.revokeObjectURL(url);
          }}
          sx={{
            position: 'absolute',
            top: '8px',
            right: onDelete ? '36px' : '8px',
            color: '#fff',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.22)',
            },
          }}
        >
          <Download size={'16px'} />
        </IconButton>
      )}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
        }}
      >
        {data.title}
      </Typography>
      <Typography variant="caption">{data.subtitle}</Typography>
      <Typography
        variant="caption"
        sx={{
          fontStyle: 'italic',
          opacity: 0.8,
        }}
      >
        {data.author}
      </Typography>
    </Stack>
  );
};

export const AddNewBookCard = ({
  onClick,
  isDisabled = false,
}: {
  onClick: () => void;
  isDisabled?: boolean;
}) => {
  const i18n = useLingui();
  return (
    <Stack
      onClick={() => {
        if (isDisabled) return;
        onClick();
      }}
      data-testid="add-new-book-card"
      sx={{
        padding: '16px 20px',
        borderRadius: '8px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.65 : 1,
        color: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
      }}
    >
      <CirclePlus size={'40px'} strokeWidth={'1px'} />
      <Typography>{i18n._('Add a book')}</Typography>
    </Stack>
  );
};
