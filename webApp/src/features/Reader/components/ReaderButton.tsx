import { Button } from '@mui/material';
import { ReactNode } from 'react';

export const ReaderButton = ({
  children,
  onClick,
  startIcon,
  disabled = false,
  type = 'primary',
}: {
  children: string;
  onClick?: () => void;
  startIcon?: ReactNode;
  disabled?: boolean;
  type?: 'error' | 'primary';
}) => {
  return (
    <Button
      startIcon={startIcon}
      disabled={disabled}
      onClick={onClick}
      sx={{
        backgroundColor: type === 'error' ? '#EB5452' : '#5285eb',
        borderRadius: '50px',
        color: '#fff',
        boxShadow: 'none',
        padding: '5px 2px 5px 0',
        position: 'relative',
        zIndex: 1,
        ':hover': {
          boxShadow: 'none',
          backgroundColor: type === 'error' ? '#c7403e' : '#3b6ac9',
        },
        ':disabled': {
          backgroundColor: type === 'error' ? '#EB5452' : '#5285eb',
          opacity: 0.6,
          color: '#fff',
        },
      }}
      variant="contained"
    >
      {children}
    </Button>
  );
};
