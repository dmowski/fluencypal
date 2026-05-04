import { useLingui } from '@lingui/react';
import { Popover, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

export interface ReaderChapterItem {
  id: string;
  label: string;
  targetPage: number | null;
  children: ReaderChapterItem[];
}

const renderChapterTree = ({
  items,
  level,
  activeChapterId,
  onSelect,
}: {
  items: ReaderChapterItem[];
  level: number;
  activeChapterId: string | null;
  onSelect: (targetPage: number) => void;
}): ReactNode =>
  items.map((item) => {
    const isClickable = Number.isFinite(item.targetPage) && (item.targetPage as number) > 0;
    const isActive = item.id === activeChapterId;

    return (
      <Stack key={item.id} sx={{ width: '100%' }}>
        <Stack
          component="button"
          type="button"
          data-testid="reader-chapter-item"
          data-target-page={item.targetPage ?? ''}
          onClick={() => {
            if (!isClickable || item.targetPage == null) return;
            onSelect(item.targetPage);
          }}
          sx={{
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            color: '#222',
            cursor: isClickable ? 'pointer' : 'default',
            opacity: isClickable ? 1 : 0.55,
            fontWeight: isActive ? 700 : 400,
            fontSize: '15px',
            padding: '6px 4px 6px 10px',
            marginLeft: `${level * 14}px`,
            borderRadius: '4px',
            '&:hover': isClickable
              ? {
                  backgroundColor: 'rgba(34, 34, 34, 0.08)',
                }
              : undefined,
          }}
        >
          {item.label}
        </Stack>

        {item.children.length > 0
          ? renderChapterTree({
              items: item.children,
              level: level + 1,
              activeChapterId,
              onSelect,
            })
          : null}
      </Stack>
    );
  });

export const ReaderChaptersPopover = ({
  anchorEl,
  chapters,
  activeChapterId,
  onClose,
  onSelect,
}: {
  anchorEl: HTMLElement | null;
  chapters: ReaderChapterItem[];
  activeChapterId: string | null;
  onClose: () => void;
  onSelect: (targetPage: number) => void;
}) => {
  const { i18n } = useLingui();
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#FFF3DD',
            color: '#222',
            marginTop: '8px',
            minWidth: '280px',
            maxWidth: '300px',
            maxHeight: '70vh',
            border: '1px solid rgba(34, 34, 34, 0.18)',
          },
        },
      }}
    >
      <Stack data-testid="reader-chapters-popover" sx={{ padding: '10px 8px', overflowY: 'auto' }}>
        {chapters.length > 0 ? (
          renderChapterTree({ items: chapters, level: 0, activeChapterId, onSelect })
        ) : (
          <Typography sx={{ fontFamily: 'serif', fontSize: '14px', padding: '8px' }}>
            {i18n._('No chapters available')}
          </Typography>
        )}
      </Stack>
    </Popover>
  );
};
