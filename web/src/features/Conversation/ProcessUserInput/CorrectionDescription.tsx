import { Button, Typography } from '@mui/material';

export const CorrectionDescription = ({
  content,
  limit,
  isShowFullContent,
  onToggleShowFullContent,
  showMoreLabel,
  showLessLabel,
}: {
  content: string;
  limit: number;
  isShowFullContent: boolean;
  onToggleShowFullContent: () => void;
  showMoreLabel: string;
  showLessLabel: string;
}) => {
  if (!content) return null;

  const isContentLong = content.length > limit;
  const visibleContent =
    isContentLong && !isShowFullContent ? content.slice(0, limit) + '...' : content;

  return (
    <Typography
      variant="body2"
      sx={{
        opacity: 0.87,
      }}
    >
      {visibleContent}

      {isContentLong && (
        <Button
          size="small"
          onClick={onToggleShowFullContent}
          sx={{
            textTransform: 'none',
            marginLeft: '5px',
            padding: 0,
            minWidth: 0,
          }}
        >
          {isShowFullContent ? showLessLabel : showMoreLabel}
        </Button>
      )}
    </Typography>
  );
};
