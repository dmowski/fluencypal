import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
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
  testId,
}: {
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  activeButton: React.ReactNode;
  inactiveButton: React.ReactNode;
  isActive: boolean;
  isLocked?: boolean;
  testId?: string;
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
        title={
          isLocked ? (
            <Typography
              variant="caption"
              sx={{
                fontSize: '13px',
                padding: '8px 0',
                fontWeight: 600,
              }}
            >
              {i18n._('Unlock full access to continue')}
            </Typography>
          ) : (
            ''
          )
        }
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
              background: 'linear-gradient(145deg, rgb(10, 163, 104), rgb(10, 163, 104))',
            },
          },
          arrow: {
            sx: {
              color: 'rgb(10, 163, 104)',
            },
          },
        }}
      >
        <Stack>
          <IconButton
            sx={{
              boxShadow: isLocked ? '0 0 0 2px rgba(222, 222, 222, 0)' : 'none',
              background: isLocked
                ? 'rgb(10, 163, 104)'
                : isActive
                  ? 'rgba(100, 100, 100, 0.4)'
                  : 'rgb(250 222 220)',
              color: isLocked ? '#fff' : isActive ? '#fff' : '#222',
              ':hover': {
                backgroundColor: isActive ? 'rgba(100, 100, 100, 0.2)' : 'rgba(250, 222, 220, 0.8)',
              },
            }}
            size="large"
            aria-label={label}
            data-testid={testId}
            onClick={(event) => onClick(event)}
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
