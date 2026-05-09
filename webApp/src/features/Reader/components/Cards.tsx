'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Box, Button, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { Book } from '../model/types';
import { ReaderLibraryBook } from '../model/library';
import { getDownloadFileName } from '../utils/epubFileName';
import { useLingui } from '@lingui/react';
import { CirclePlus, Download, MoreVertical, RefreshCw, Trash2 } from 'lucide-react';

export const BookCard = ({
  data,
  onClick,
  onDelete,
  onDownloadFromBlob,
  onReimport,
}: {
  data: Book;
  onClick: (data: Book) => void;
  onDelete?: (data: Book) => void;
  onDownloadFromBlob?: (data: Book) => Promise<void> | void;
  onReimport?: (data: Book) => void;
}) => {
  const i18n = useLingui();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const canDownload = Boolean(data.originalFile || data.originalFileBlobPath);
  const hasMenuItems = Boolean(onDelete || canDownload || onReimport);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleDownload = async () => {
    handleMenuClose();
    if (data.originalFile) {
      const url = URL.createObjectURL(data.originalFile);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = getDownloadFileName(data.originalFile.name);
      anchor.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (onDownloadFromBlob) {
      await onDownloadFromBlob(data);
    }
  };

  return (
    <Stack
      onClick={() => onClick(data)}
      sx={{
        padding: '36px 45px 36px 36px',
        borderRadius: '8px',
        maxWidth: '100%',
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
      {hasMenuItems && (
        <>
          <IconButton
            size="small"
            aria-label="Book options"
            data-testid={`book-menu-${data.id}`}
            onClick={handleMenuOpen}
            sx={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              color: '#fff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
              },
            }}
          >
            <MoreVertical size={'16px'} />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            onClick={(e) => e.stopPropagation()}
            slotProps={{ paper: { sx: { minWidth: '160px' } } }}
          >
            {onReimport && (
              <MenuItem
                data-testid={`book-reimport-${data.id}`}
                onClick={() => {
                  handleMenuClose();
                  onReimport(data);
                }}
              >
                <RefreshCw size={'14px'} style={{ marginRight: '8px' }} />
                {i18n._('Re-import')}
              </MenuItem>
            )}
            {canDownload && (
              <MenuItem
                data-testid={`book-download-${data.id}`}
                onClick={() => {
                  void handleDownload();
                }}
              >
                <Download size={'14px'} style={{ marginRight: '8px' }} />
                {i18n._('Download')}
              </MenuItem>
            )}
            {onDelete && (
              <MenuItem
                data-testid={`book-delete-${data.id}`}
                onClick={() => {
                  handleMenuClose();
                  onDelete(data);
                }}
              >
                <Trash2 size={'14px'} style={{ marginRight: '8px' }} />
                {i18n._('Delete')}
              </MenuItem>
            )}
          </Menu>
        </>
      )}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          '@media (max-width: 600px)': {
            fontSize: '1.25rem',
          },
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

      <Typography
        variant="caption"
        sx={{
          paddingTop: '20px',
          opacity: 0.5,
        }}
      >
        id: {data.id}
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
  priority = false,
}: {
  data: ReaderLibraryBook;
  onClick: (data: ReaderLibraryBook) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  priority?: boolean;
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
        position: 'relative',
        alignItems: 'flex-start',
        '@media (max-width: 600px)': {
          width: '100%',
        },
      }}
    >
      <Box
        sx={{
          width: '90px',
          minWidth: '90px',
          aspectRatio: '2 / 3',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: 'rgba(0, 0, 0, 0.08)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          ':after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            borderRadius: '8px',
            boxShadow: 'inset 0px 0px 0px 1px rgba(0, 0, 0, .1)',
          },
        }}
      >
        {data.coverUrl ? (
          <Image
            src={data.coverUrl}
            alt=""
            fill
            sizes="100px"
            style={{ objectFit: 'cover' }}
            priority={priority}
          />
        ) : (
          <Typography variant="caption" sx={{ opacity: 0.65 }}>
            {i18n._('Project Gutenberg')}
          </Typography>
        )}
      </Box>

      <Stack sx={{ gap: '4px', flex: '1 1 auto', minWidth: 0 }}>
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
          {i18n._('{count} downloads', { count: data.downloads.toLocaleString('en-US') })}
        </Typography>
        <Box sx={{ pt: '4px' }}>
          <Button
            size="small"
            variant="outlined"
            disabled={isDisabled}
            sx={{
              borderColor: 'rgba(0, 0, 0, 0.4)',
              color: 'rgba(0, 0, 0, 0.87)',
              '&:hover': {
                borderColor: 'rgba(0, 0, 0, 0.22)',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
              '&[disabled]': {
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.4)',
              },
            }}
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
