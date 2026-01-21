import { useWindowSizes } from '@/features/Layout/useWindowSizes';
import { IconButton, Modal, Stack } from '@mui/material';
import { X } from 'lucide-react';
import { JSX } from 'react';

interface CustomModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export const CustomModal = ({ isOpen, onClose, children }: CustomModalProps): JSX.Element => {
  const sizes = useWindowSizes();
  if (!isOpen) return <></>;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      sx={{
        zIndex: 999,
      }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
          },
        },
      }}
    >
      <Stack
        sx={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100dvw',
          maxWidth: '100vw',
          backgroundColor: '#181818',
          height: '100dvh',
          maxHeight: '100dvh',
          boxSizing: 'border-box',
        }}
      >
        {onClose && (
          <IconButton
            sx={{
              position: 'absolute',
              top: `calc(${sizes.topOffset} + 10px)`,
              right: '10px',
              zIndex: 100,
              color: 'rgba(255, 255, 255, 1)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
            onClick={() => onClose()}
            size="large"
          >
            <X strokeWidth={'3px'} />
          </IconButton>
        )}
        <Stack
          sx={{
            gap: '0px',
            width: '100%',
            maxHeight: '100vh',
            overflow: 'auto',
          }}
        >
          <Stack
            sx={{
              height: 'max-content',
              width: '100%',
            }}
          >
            <Stack
              sx={{
                width: '100%',
                height: sizes.topOffset,
              }}
            />

            <Stack
              sx={{
                width: '100%',
                alignItems: 'center',
                padding: '40px',
                boxSizing: 'border-box',
                minHeight: `calc(100dvh - ${sizes.topOffset} - ${sizes.bottomOffset} - 0px)`,
                '@media (max-width: 600px)': {
                  padding: '20px 10px',
                },
              }}
            >
              {children}
            </Stack>

            <Stack
              sx={{
                width: '100%',
                height: sizes.bottomOffset,
              }}
            />
          </Stack>
        </Stack>
      </Stack>
    </Modal>
  );
};
