'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Box, Button, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { Book } from '../model/types';
import { ReaderLibraryBook } from '../model/library';
import { getDownloadFileName } from '../utils/epubFileName';
import { useLingui } from '@lingui/react';
import {
  CirclePlus,
  Download,
  MoreVertical,
  RefreshCw,
  Share2,
  Trash2,
  Tablet,
} from 'lucide-react';

export const BookCard = ({
  data,
  onClick,
  onDelete,
  onDownloadFromBlob,
  onReimport,
  onShare,
  onSendToKindle,
}: {
  data: Book;
  onClick: (data: Book) => void;
  onDelete?: (data: Book) => void;
  onDownloadFromBlob?: (data: Book, ext?: string) => Promise<void> | void;
  onReimport?: (data: Book) => void;
  onShare?: (data: Book) => void;
  onSendToKindle?: (data: Book) => void;
}) => {
  const i18n = useLingui();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  // Build the list of download options:
  // - Converted books have an entry per stored format (e.g. pdf + epub).
  // - Legacy EPUB books (no convertedFiles) show a single "Download EPUB".
  const downloadOptions: Array<{ ext: string; label: string; blobPath: string | null }> = (() => {
    if (data.convertedFiles && Object.keys(data.convertedFiles).length > 0) {
      return Object.entries(data.convertedFiles).map(([ext, path]) => ({
        ext,
        label:
          ext === 'epub' ? i18n._('Download EPUB') : i18n._('Download') + ` ${ext.toUpperCase()}`,
        blobPath: path,
      }));
    }
    if (data.originalFile || data.originalFileBlobPath) {
      return [
        {
          ext: 'epub',
          label: i18n._('Download EPUB'),
          blobPath: data.originalFileBlobPath ?? null,
        },
      ];
    }
    return [];
  })();

  const canDownload = downloadOptions.length > 0;
  const canSendToKindle =
    Boolean(data.originalFileBlobPath) || Boolean(data.convertedFiles?.['epub']);
  const hasMenuItems = Boolean(
    onDelete || canDownload || onReimport || onShare || (onSendToKindle && canSendToKindle),
  );
  const firstImage = data.imagesByHref ? (Object.values(data.imagesByHref)[0] ?? null) : null;
  const progressPercent =
    data.paragraphs.length > 0 && data.readingPosition
      ? Math.round((data.readingPosition.paragraphIndex / data.paragraphs.length) * 100)
      : 0;

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleDownload = async (ext: string, blobPath: string | null) => {
    handleMenuClose();
    if (!blobPath) {
      // File is only in memory (not yet synced) — use the in-memory original.
      if (data.originalFile) {
        const url = URL.createObjectURL(data.originalFile);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = getDownloadFileName(data.originalFile.name);
        anchor.click();
        URL.revokeObjectURL(url);
      }
      return;
    }
    if (onDownloadFromBlob) {
      await onDownloadFromBlob(data, ext);
    }
  };

  const cardBorderRadius = '10px';

  return (
    <Stack
      onClick={() => onClick(data)}
      sx={{
        width: '360px',
        minHeight: '136px',
        borderRadius: cardBorderRadius,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        flexDirection: 'row',
        gap: '12px',
        padding: '12px',
        paddingLeft: firstImage ? '14px' : '24px',
        color: '#fff',
        '@media (max-width: 600px)': {
          width: '100%',
        },
      }}
    >
      {/* Blurred background */}
      {firstImage ? (
        <>
          <Box
            component="img"
            src={firstImage}
            alt=""
            sx={{
              position: 'absolute',
              inset: '-20px',
              borderRadius: cardBorderRadius,
              overflow: 'hidden',
              width: 'calc(100% + 40px)',
              height: 'calc(100% + 40px)',
              objectFit: 'cover',
              filter: 'blur(22px)',
              zIndex: 0,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              borderRadius: cardBorderRadius,
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1,
            }}
          />
        </>
      ) : (
        <Box
          sx={{
            position: 'absolute',
            borderRadius: cardBorderRadius,
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 0,
          }}
        />
      )}

      {/* Menu button */}
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
              zIndex: 10,
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
            {onShare && (
              <MenuItem
                data-testid={`book-share-${data.id}`}
                onClick={() => {
                  handleMenuClose();
                  onShare(data);
                }}
              >
                <Share2 size={'14px'} style={{ marginRight: '8px' }} />
                {i18n._('Share')}
              </MenuItem>
            )}
            {onSendToKindle && canSendToKindle && (
              <MenuItem
                data-testid={`book-send-to-kindle-${data.id}`}
                onClick={() => {
                  handleMenuClose();
                  onSendToKindle(data);
                }}
              >
                <Tablet size={'14px'} style={{ marginRight: '8px' }} />
                {i18n._('Send to Kindle')}
              </MenuItem>
            )}
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
            {canDownload &&
              downloadOptions.map(({ ext, label, blobPath }) => (
                <MenuItem
                  key={ext}
                  data-testid={`book-download-${ext}-${data.id}`}
                  onClick={() => {
                    void handleDownload(ext, blobPath);
                  }}
                >
                  <Download size={'14px'} style={{ marginRight: '8px' }} />
                  {label}
                </MenuItem>
              ))}
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

      {/* Cover image */}
      {firstImage && (
        <Box
          sx={{
            width: '70px',
            minWidth: '70px',
            aspectRatio: '2 / 3',
            overflow: 'hidden',
            position: 'relative',
            borderRadius: '3px',
            zIndex: 2,
            flexShrink: 0,
            alignSelf: 'center',
            ':after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              borderRadius: '3px',
              boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, .18)',
            },
          }}
        >
          <Box
            component="img"
            src={firstImage}
            alt={data.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Box>
      )}

      {/* Text content */}
      <Stack
        sx={{
          gap: '3px',
          flex: '1 1 auto',
          minWidth: 0,
          zIndex: 2,
          justifyContent: 'center',
          pr: hasMenuItems ? '24px' : 0,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: '#fff',
          }}
        >
          {data.title}
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontStyle: 'italic', opacity: 0.8, color: '#fff' }}
          noWrap
        >
          {data.author}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.6, color: '#fff' }}>
          {progressPercent}%
        </Typography>
      </Stack>
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
