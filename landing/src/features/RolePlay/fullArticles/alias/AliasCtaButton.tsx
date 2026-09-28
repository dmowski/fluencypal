'use client';

import { Button } from '@mui/material';
import { buttonStyle } from '@/features/Landing/landingSettings';

interface AliasCtaButtonProps {
  href: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const AliasCtaButton = ({ href, children, fullWidth }: AliasCtaButtonProps) => {
  return (
    <Button
      href={href}
      variant="contained"
      sx={{
        ...buttonStyle,
        height: '3rem',
        borderRadius: '50px',
        ...(fullWidth ? { width: '100%', maxWidth: '400px' } : {}),
      }}
    >
      {children}
    </Button>
  );
};
