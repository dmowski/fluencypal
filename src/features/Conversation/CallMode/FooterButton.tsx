import { IconButton, Stack } from '@mui/material';
import { CircleQuestionMark, Lock } from 'lucide-react';
import LockIcon from '@mui/icons-material/Lock';

export const FooterButton = ({
  label,
  onClick,
  activeButton,
  inactiveButton,
  isActive,
  isLocked,
}: {
  label: string;
  onClick: () => void;
  activeButton: React.ReactNode;
  inactiveButton: React.ReactNode;
  isActive: boolean;
  isLocked?: boolean;
}) => {
  return (
    <Stack
      sx={{
        position: 'relative',
      }}
    >
      <IconButton
        sx={{
          boxShadow: isLocked ? '0 0 0 2px rgb(222, 222, 222)' : 'none',
          background: isLocked
            ? 'linear-gradient(145deg, rgb(163, 10, 10), rgb(58, 2, 60))'
            : isActive
              ? 'rgba(100, 100, 100, 0.4)'
              : 'rgb(250 222 220)',
          color: isActive ? '#fff' : '#222',
          ':hover': {
            backgroundColor: isActive ? 'rgba(100, 100, 100, 0.2)' : 'rgba(250, 222, 220, 0.8)',
          },
        }}
        size="large"
        onClick={() => onClick()}
        title={label}
      >
        {isActive ? activeButton : inactiveButton}
      </IconButton>
      {isLocked && (
        <Stack
          sx={{
            position: 'absolute',
            bottom: '-1px',
            right: '-1px',
            backgroundColor: 'rgba(0, 0, 0, 1)',
            borderRadius: '100px',
            padding: '4px',
            pointerEvents: 'none',
            boxShadow: '0 0 0 2px rgba(222, 222, 222, 1)',
          }}
        >
          <LockIcon
            fontSize="small"
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 1)',
            }}
          />
        </Stack>
      )}
    </Stack>
  );
};
