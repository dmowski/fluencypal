import { Stack } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PaginationPanel = ({
  onPrevious,
  onNext,
  isFirstPage,
  isLastPage,
}: {
  onPrevious: () => void;
  onNext: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}) => {
  return (
    <>
      <PaginationButton type="previous" disabled={isFirstPage} onClick={onPrevious} />
      <PaginationButton type="next" disabled={isLastPage} onClick={onNext} />
    </>
  );
};

const PaginationButton = ({
  onClick,
  disabled,
  type,
}: {
  onClick: () => void;
  disabled: boolean;
  type: 'previous' | 'next';
}) => {
  return (
    <Stack
      component={'button'}
      sx={{
        border: 'none',
        color: '#333',
        opacity: disabled ? 0.4 : 1,
        borderRadius: '50px',
        padding: '15px',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        left: type === 'previous' ? '0px' : 'auto',
        right: type === 'next' ? '0px' : 'auto',

        ':hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          cursor: disabled ? 'default' : 'pointer',
        },
        '@media (max-width: 600px)': {
          transform: 'none',
          top: 'auto',
          bottom: '0px',
        },
        zIndex: 3,
      }}
      disabled={disabled}
      onClick={onClick}
    >
      {type === 'previous' ? <ChevronLeft /> : <ChevronRight />}
    </Stack>
  );
};
