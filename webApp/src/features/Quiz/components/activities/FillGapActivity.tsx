'use client';

import { useLingui } from '@lingui/react';
import { Box, Menu, MenuItem, Stack, Typography } from '@mui/material';
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
  const { i18n } = useLingui();
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

  const hasUnfilledGap = Object.keys(question.gaps).some((gapId) => !selections[gapId]);

  return (
    <Stack sx={{ gap: '12px' }}>
      <Typography variant="body1" component="div" sx={{ lineHeight: 2.2, fontSize: '20px' }}>
        {question.segments.map((segment, index) => {
          if (segment.kind === 'text') {
            return <span key={`text-${index}`}>{segment.text}</span>;
          }
          const gapId = segment.gapId;
          const isFilled = Boolean(selections[gapId]);
          return (
            <Box
              key={gapId}
              component="button"
              type="button"
              disabled={disabled}
              onClick={(event) => openGapMenu(gapId, event.currentTarget)}
              data-testid={`quiz-fill-gap-${gapId}`}
              aria-label={i18n._('Choose a word for the blank')}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                verticalAlign: 'baseline',
                margin: '0 4px',
                padding: '2px 6px',
                minWidth: isFilled ? 'auto' : '108px',
                height: '28px',
                borderRadius: '6px',
                border: isFilled ? '1px solid #7dcea0' : '1px dashed rgba(41, 179, 229, 0.75)',
                backgroundColor: isFilled
                  ? 'rgba(125, 206, 160, 0.14)'
                  : 'rgba(41, 179, 229, 0.16)',
                color: isFilled ? '#7dcea0' : 'transparent',
                fontSize: '14px',
                fontFamily: 'inherit',
                lineHeight: 1.2,
                fontWeight: 500,
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 1 : 1,
                transition: 'border-color 150ms ease, background-color 150ms ease',
                position: 'relative',
                top: '0',
                '&:hover': disabled
                  ? undefined
                  : {
                      borderColor: isFilled ? '#9be8b8' : 'rgba(41, 179, 229, 1)',
                      backgroundColor: isFilled
                        ? 'rgba(125, 206, 160, 0.22)'
                        : 'rgba(41, 179, 229, 0.24)',
                    },
                '&:focus-visible': {
                  outline: '2px solid rgba(41, 179, 229, 0.8)',
                  outlineOffset: '2px',
                },
              }}
            >
              {labelForGap(gapId)}
            </Box>
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
