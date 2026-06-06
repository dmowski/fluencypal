'use client';

import { Button, Menu, MenuItem, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { FillGapQuestion } from '../../types';

export const FillGapActivity = ({
  question,
  selections,
  onSelectGap,
  disabled,
}: {
  question: FillGapQuestion;
  selections: Record<string, string>;
  onSelectGap: (gapId: string, optionId: string) => void;
  disabled?: boolean;
}) => {
  const [menuGapId, setMenuGapId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const openGapMenu = (gapId: string, element: HTMLElement) => {
    if (disabled) return;
    setMenuGapId(gapId);
    setAnchorEl(element);
  };

  const closeMenu = () => {
    setMenuGapId(null);
    setAnchorEl(null);
  };

  const labelForGap = (gapId: string) => {
    const selectedId = selections[gapId];
    if (!selectedId) return '___';
    const gap = question.gaps[gapId];
    return gap?.options.find((o) => o.id === selectedId)?.label ?? '___';
  };

  return (
    <Stack sx={{ gap: '12px' }}>
      <Typography variant="body1" component="div" sx={{ lineHeight: 2, fontSize: '20px' }}>
        {question.segments.map((segment, index) => {
          if (segment.kind === 'text') {
            return <span key={`text-${index}`}>{segment.text}</span>;
          }
          const gapId = segment.gapId;
          return (
            <Button
              key={gapId}
              variant="text"
              disabled={disabled}
              onClick={(event) => openGapMenu(gapId, event.currentTarget)}
              sx={{
                textTransform: 'none',
                minWidth: '40px',
                padding: '0 6px',
                margin: '0 2px',
                textDecoration: 'underline',
                color: selections[gapId] ? '#7dcea0' : '#EBEBF5',
                verticalAlign: 'baseline',
              }}
            >
              {labelForGap(gapId)}
            </Button>
          );
        })}
      </Typography>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl && menuGapId)} onClose={closeMenu}>
        {menuGapId &&
          question.gaps[menuGapId]?.options.map((option) => (
            <MenuItem
              key={option.id}
              selected={selections[menuGapId] === option.id}
              onClick={() => {
                onSelectGap(menuGapId, option.id);
                closeMenu();
              }}
            >
              {option.label}
            </MenuItem>
          ))}
      </Menu>
    </Stack>
  );
};
