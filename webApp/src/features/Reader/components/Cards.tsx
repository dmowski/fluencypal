'use client';

import Image from 'next/image';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { Book } from '../model/types';
import { ReaderLibraryBook } from '../model/library';
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
        '@media (max-width: 600px)': {
          padding: '42px 30px 52px 20px',
        },
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

export const LibraryBookCard = ({
  data,
  onClick,
  isDisabled = false,
  isLoading = false,
}: {
  data: ReaderLibraryBook;
  onClick: (data: ReaderLibraryBook) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}) => {
  const i18n = useLingui();

  return (
    <Stack
      onClick={() => {
        if (isDisabled) return;
        onClick(data);
      }}
      data-testid={`reader-library-book-${data.ebookId}`}
      sx={{
        width: '360px',
        minHeight: '136px',
        padding: '12px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255, 255, 255, 0.55)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        gap: '12px',
        flexDirection: 'row',
        alignItems: 'stretch',
        position: 'relative',
        '@media (max-width: 600px)': {
          width: '100%',
        },
      }}
    >
      <Box
        sx={{
          width: '100px',
          minWidth: '100px',
          height: '112px',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {data.coverUrl ? (
          <Image src={data.coverUrl} alt="" fill sizes="100px" style={{ objectFit: 'cover' }} />
        ) : (
          <Typography variant="caption" sx={{ opacity: 0.65 }}>
            {i18n._('Project Gutenberg')}
          </Typography>
        )}
      </Box>

      <Stack sx={{ gap: '4px', flex: '1 1 auto', minWidth: 0 }}>
        <Typography variant="overline" sx={{ letterSpacing: '0.08em', opacity: 0.7 }}>
          {i18n._('Library')}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {data.title}
        </Typography>
        <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.8 }} noWrap>
          {data.author}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {i18n._('{{count}} downloads', { count: data.downloads.toLocaleString('en-US') })}
        </Typography>
        <Box sx={{ pt: '4px' }}>
          <Button
            size="small"
            variant="outlined"
            disabled={isDisabled}
            startIcon={<Download size={'14px'} />}
            onClick={(event) => {
              event.stopPropagation();
              if (isDisabled) return;
              onClick(data);
            }}
          >
            {isLoading ? i18n._('Downloading...') : i18n._('Download')}
          </Button>
        </Box>
      </Stack>
    </Stack>
  );
};
