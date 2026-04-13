'use client';

import { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { CircleEllipsis, ShieldAlert } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { useUserReport } from './useUserReport';

export const UserMenu = ({ userId }: { userId: string }) => {
  const { i18n } = useLingui();
  const userReport = useUserReport();

  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
  const isOpen = !!anchorElement;

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElement(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorElement(null);
  };

  const onReportUser = () => {
    closeMenu();
    userReport.openReportModal(userId);
  };

  return (
    <>
      <IconButton onClick={openMenu}>
        <CircleEllipsis size={'16px'} />
      </IconButton>

      <Menu anchorEl={anchorElement} open={isOpen} onClose={closeMenu}>
        <MenuItem onClick={onReportUser}>
          <ShieldAlert size={'16px'} />
          &nbsp;{i18n._('Report User')}
        </MenuItem>
      </Menu>
    </>
  );
};
