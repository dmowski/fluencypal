import { Stack, Typography } from '@mui/material';
import { Lock } from 'lucide-react';

import { ReactNode } from 'react';

interface ConversationCardProps {
  title: string;
  subTitle: string;
  onClick?: () => void;
  href?: string;
  startColor: string;
  endColor: string;
  bgColor: string;
  icon: ReactNode;
  actionLabel: string;
  disabledLabel?: string;
}

export const ConversationLandingCard = ({
  title,
  subTitle,
  onClick,
  startColor,
  endColor,
  bgColor,
  icon,
  actionLabel,
  href,
}: ConversationCardProps) => {
  return (
    <Stack
      onClick={onClick}
      component={href ? 'a' : 'button'}
      href={href}
      sx={{
        textDecoration: 'none',
        padding: '20px 20px 20px 20px',
        borderRadius: '16px',
        gap: '0px',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(10, 18, 30, 1)',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s ease',
        cursor: 'pointer',

        // allow text selection
        userSelect: 'text',

        color: '#fff',
        opacity: 1,

        '.mini-card': {
          position: 'absolute',
          bottom: '0px',
          right: '20px',
          width: '200px',
          height: '140px',
          boxSizing: 'border-box',
          transition: 'all 0.3s ease',
          boxShadow: '0px 0px 26px rgba(0, 0, 0, 0.3)',
          backgroundColor: '#1E1E1E',
          padding: '20px',
          borderRadius: '16px 16px 0 0',
          '@media (max-width: 750px)': {
            width: '250px',
          },
          '@media (max-width: 450px)': {
            width: '150px',
          },
        },

        ':hover': {
          transform: 'scale(1.02)',
          '.avatar': {
            transform: 'scale(1.08) rotate(1deg)',
          },
        },
      }}
    >
      <Typography
        align="left"
        variant="body2"
        sx={{
          fontWeight: 300,
          opacity: 1,
          textTransform: 'uppercase',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {subTitle}
      </Typography>

      <Typography
        align="left"
        sx={{
          fontWeight: 800,
          textTransform: 'uppercase',
          fontSize: '1.8rem',
          position: 'relative',
          zIndex: 2,
          opacity: 1,
          '@media (max-width: 450px)': {
            fontSize: '1.4rem',
          },
        }}
      >
        {title}
      </Typography>

      <Stack
        sx={{
          flexDirection: 'row',
          gap: '8px',
          alignItems: 'center',
          padding: '70px 14px 0px 0px',
          borderRadius: '8px',
          opacity: 1,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Typography variant="body2">{actionLabel}</Typography>
      </Stack>

      <Stack
        sx={{
          paddingTop: '0px',
          width: 'max-content',
          position: 'absolute',
          bottom: '0px',
          right: '0px',
          zIndex: 2,

          '.avatar': {
            transition: 'all 0.4s ease',
            opacity: 1,
            img: {
              width: '150px',
              height: '150px',
            },
          },
        }}
      >
        {icon}
      </Stack>

      <Stack
        sx={{
          backgroundColor: startColor,
          width: '320px',
          height: '120px',
          borderRadius: '40px',
          filter: 'blur(50px)',

          position: 'absolute',
          top: '-40px',
          left: '-20px',
          zIndex: 1,
          opacity: 0.9,
        }}
      ></Stack>

      <Stack
        sx={{
          backgroundColor: endColor,
          width: '320px',
          height: '120px',
          borderRadius: '40px',
          filter: 'blur(80px)',

          position: 'absolute',
          bottom: '-40px',
          right: '-20px',
          zIndex: 1,
          opacity: 0.9,
        }}
      ></Stack>

      <Stack
        sx={{
          backgroundColor: bgColor,
          width: '100%',
          height: '100%',

          position: 'absolute',
          bottom: '0px',
          left: '0px',
          zIndex: 0,
          opacity: 0.1,
        }}
      ></Stack>

      <Stack
        sx={{
          width: '100%',
          height: '100%',

          position: 'absolute',
          bottom: '0px',
          left: '0px',
          zIndex: -1,
          opacity: 1,
        }}
      ></Stack>
    </Stack>
  );
};
