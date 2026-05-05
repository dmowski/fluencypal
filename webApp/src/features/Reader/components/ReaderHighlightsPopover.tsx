import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

export interface ReaderHighlightItem {
  id: string;
  beforeText: string;
  highlightedText: string;
  afterText: string;
  color: string;
  targetPage: number | null;
}

const renderHighlightList = ({
  items,
  onSelect,
}: {
  items: ReaderHighlightItem[];
  onSelect: (targetPage: number) => void;
}): ReactNode =>
  items.map((item) => {
    const isClickable = Number.isFinite(item.targetPage) && (item.targetPage as number) > 0;

    return (
      <Stack key={item.id} sx={{ width: '100%' }}>
        <Stack
          component="button"
          type="button"
          data-testid="reader-highlight-item"
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
            opacity: isClickable ? 1 : 0.6,
            fontSize: '14px',
            lineHeight: 1.5,
            padding: '8px',
            borderRadius: '4px',
            '&:hover': isClickable
              ? {
                  backgroundColor: 'rgba(34, 34, 34, 0.08)',
                }
              : undefined,
          }}
        >
          <Typography
            component="span"
            data-testid="reader-highlight-before-text"
            sx={{ color: '#444' }}
          >
            {item.beforeText}
          </Typography>
          <Typography
            component="span"
            data-testid="reader-highlight-selected-text"
            sx={{
              display: 'inline',
              backgroundColor: item.color,
              borderRadius: '2px',
              padding: '0 1px',
            }}
          >
            {item.highlightedText}
          </Typography>
          <Typography
            component="span"
            data-testid="reader-highlight-after-text"
            sx={{ color: '#444' }}
          >
            {item.afterText}
          </Typography>
        </Stack>
      </Stack>
    );
  });

export const ReaderHighlightsList = ({
  highlights,
  onSelect,
}: {
  highlights: ReaderHighlightItem[];
  onSelect: (targetPage: number) => void;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack
      data-testid="reader-highlights-popover"
      sx={{
        padding: '10px 8px',
        overflowY: 'auto',
        maxHeight: '55vh',
      }}
    >
      {highlights.length > 0 ? (
        renderHighlightList({ items: highlights, onSelect })
      ) : (
        <Typography sx={{ fontFamily: 'serif', fontSize: '14px', padding: '8px' }}>
          {i18n._('No highlights available')}
        </Typography>
      )}
    </Stack>
  );
};
