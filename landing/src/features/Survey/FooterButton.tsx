'use client';
import { Button, Stack } from '@mui/material';
import { useWindowSizes } from '../Layout/useWindowSizes';
import { ReactNode } from 'react';

export const FooterButton = ({
  disabled,
  title,
  onClick,
  startIcon,
  endIcon,
  color,
  aboveButtonComponent,
  width,
}: {
  disabled?: boolean;
  title: string;
  onClick: () => void;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  color?: 'primary' | 'success' | 'error';
  aboveButtonComponent?: ReactNode;
  width?: string;
}) => {
  const { bottomOffset } = useWindowSizes();
  return (
    <>
      <Stack
        sx={{
          display: 'block',
          width: '100%',
          minHeight: `calc(${bottomOffset} + 95px)`,
        }}
      />

      <Stack
        sx={{
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'fixed',
          width: '100dvw',
          left: '0',

          padding: '30px 0 0 0',
          bottom: 0,
          right: '0px',

          paddingBottom: `calc(${bottomOffset} + 35px)`,
          '@media (max-width: 600px)': {
            paddingBottom: `calc(${bottomOffset} + 15px)`,
          },
        }}
      >
        {aboveButtonComponent && (
          <Stack
            sx={{
              width: 'min(590px, calc(100dvw - 0px))',
            }}
          >
            {aboveButtonComponent}
          </Stack>
        )}
        <Button
          onClick={onClick}
          variant="contained"
          color={color || 'primary'}
          disabled={disabled}
          size="large"
          sx={{
            width: `min(${width || '600px'}, calc(100dvw - 20px))`,
            paddingTop: '12px',
            paddingBottom: '12px',
            borderRadius: '16px',
          }}
          fullWidth
          startIcon={startIcon}
          endIcon={endIcon}
        >
          {title}
        </Button>
        <Stack
          sx={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to top, rgba(10, 18, 30, 0.9), rgba(10, 18, 30, 0))',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: -1,
          }}
        ></Stack>
      </Stack>
    </>
  );
};
