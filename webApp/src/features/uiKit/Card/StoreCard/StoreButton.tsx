import { Button } from '@mui/material';

export const StoreButton = ({ title, onClick }: { title: string; onClick: () => void }) => {
  return (
    <Button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
      sx={{
        padding: '6px 20px',
        minWidth: '32px',
        height: '32px',
        borderRadius: '36px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#fff',
        fontSize: '14px',
        fontWeight: 500,
        letterSpacing: '0.02em',
        textTransform: 'none',
        ':hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        '@media (max-width: 600px)': {
          height: '30px',
          padding: '0 15px',
          fontSize: '12px',
        },
        '@media (max-width: 400px)': {
          height: '30px',
          fontSize: '11px',
        },
      }}
    >
      {title}
    </Button>
  );
};
