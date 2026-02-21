import { IconButton, Stack, Tooltip } from '@mui/material';
import { CircleQuestionMark, Lock } from 'lucide-react';
import LockIcon from '@mui/icons-material/Lock';
import { useLingui } from '@lingui/react';

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
  const { i18n } = useLingui();
  return (
    <Stack
      sx={{
        position: 'relative',
      }}
    >
      <Tooltip
        placement="top"
        open={isLocked ? true : false}
        arrow
        title={isLocked ? `LIMITED` : ''}
        slotProps={{
          popper: {
            sx: {
              zIndex: 999,
            },
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, -6],
                },
              },
            ],
          },
          tooltip: {
            sx: {
              background: 'linear-gradient(145deg, rgb(163, 10, 10), rgb(58, 2, 60))',
            },
          },
          arrow: {
            sx: {
              color: 'rgba(94, 5, 43, 1)',
            },
          },
        }}
      >
        <Stack>
          <IconButton
            sx={{
              boxShadow: isLocked ? '0 0 0 2px rgba(222, 222, 222, 0)' : 'none',
              background: isLocked
                ? 'linear-gradient(145deg, rgb(163, 10, 10), rgb(58, 2, 60))'
                : isActive
                  ? 'rgba(100, 100, 100, 0.4)'
                  : 'rgb(250 222 220)',
              color: isLocked ? '#fff' : isActive ? '#fff' : '#222',
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
        </Stack>
      </Tooltip>
      {isLocked && (
        <Stack
          sx={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            backgroundColor: 'rgba(0, 0, 0, 1)',
            borderRadius: '100px',
            padding: '4px',
            pointerEvents: 'none',
            boxShadow: '0 0 0 1px rgba(222, 222, 222, 1)',
          }}
        >
          <LockIcon
            fontSize="small"
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 1)',
            }}
          />
        </Stack>
      )}
    </Stack>
  );
};
