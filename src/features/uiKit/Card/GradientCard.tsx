import { Stack } from '@mui/material';
import { JSX } from 'react';

interface GradientCardProps {
  startColor: string;
  endColor: string;
  backgroundColor?: string;
  children?: JSX.Element | JSX.Element[];
  strokeWidth?: string;
  padding?: string;
}
/*
https://gradient.style/#type=linear&space=lch&interpolation=decreasing&linear_named_angle=--&linear_angle=129&stops=%7B%22kind%22%3A%22stop%22%2C%22color%22%3A%22rgb%2898%25+52%25+0%25%29%22%2C%22auto%22%3A%220%22%2C%22position1%22%3A%220%22%2C%22position2%22%3A0%7D&stops=%7B%22kind%22%3A%22hint%22%2C%22auto%22%3A%2250%22%2C%22percentage%22%3A50%7D&stops=%7B%22kind%22%3A%22stop%22%2C%22color%22%3A%22oklab%2871%25+-0.08+-0.15%29%22%2C%22auto%22%3A%22100%22%2C%22position1%22%3A%22100%22%2C%22position2%22%3A0%7D
*/

export const GradientCard: React.FC<GradientCardProps> = ({
  startColor,
  endColor,

  backgroundColor,
  strokeWidth,
  children,
  padding,
}) => {
  return (
    <Stack
      sx={{
        position: 'relative',
        width: '100%',
        borderRadius: '18px',
        padding: padding || '22px 35px 24px 25px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '15px',
        backgroundColor: backgroundColor || 'rgba(10, 18, 30, 1)',
        overflow: 'hidden',
        zIndex: 0,
        boxSizing: 'border-box',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '18px',
          padding: strokeWidth || '1px',
          '--hdr-gradient': `linear-gradient(135deg in lch decreasing hue, ${startColor} 0%, ${endColor} 100% 0%)`,
          background: 'var(--hdr-gradient)',

          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          zIndex: -1,
        },
      }}
    >
      {children}
    </Stack>
  );
};
