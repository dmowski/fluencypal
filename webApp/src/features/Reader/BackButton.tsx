import { IconButton } from '@mui/material';
import { X } from 'lucide-react';

export const BackButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        top: '5px',
        right: '5px',
        zIndex: 3,
        height: '54px',
        width: '54px',
        backgroundColor: 'transparent',
        color: '#333',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <X size={18} />
    </IconButton>
  );
};
