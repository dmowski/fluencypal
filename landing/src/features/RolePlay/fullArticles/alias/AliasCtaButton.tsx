'use client';

import { Button } from '@mui/material';
import { buttonStyle } from '@/features/Landing/landingSettings';
import { AliasCtaPlacement, trackAliasCtaClicked } from './aliasAnalytics';

interface AliasCtaButtonProps {
  href: string;
  placement: AliasCtaPlacement;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const AliasCtaButton = ({ href, placement, children, fullWidth }: AliasCtaButtonProps) => {
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
      onClick={() => {
        trackAliasCtaClicked(placement);
      }}
    >
      {children}
    </Button>
  );
};
