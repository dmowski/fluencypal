'use client';

import { useState } from 'react';

import { useLingui } from '@lingui/react';
import SettingsIcon from '@mui/icons-material/Settings';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';

import {
  NEWS_COMPLEXITY_LABELS,
  NEWS_COMPLEXITY_OPTIONS,
  NEWS_SUPPORTED_COUNTRIES,
} from './constants';
import type { NewsLanguageComplexity } from './types';
import { useNews } from './useNews';

export const NewsSettingsMenu = () => {
  const { i18n } = useLingui();
  const news = useNews();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleComplexity = (next: NewsLanguageComplexity) => () => {
    news.setComplexity(next);
  };

  const handleCountry = (next: string | null) => () => {
    news.setCountryOverride(next);
    handleClose();
  };

  return (
    <>
      <IconButton
        data-testid="news-settings-button"
        aria-label={i18n._('Open news settings')}
        onClick={handleOpen}
        size="small"
      >
        <SettingsIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        data-testid="news-settings-menu"
        slotProps={{
          paper: { sx: { minWidth: 220, maxHeight: 480 } },
        }}
      >
        <ListSubheader>{i18n._('Complexity')}</ListSubheader>
        {NEWS_COMPLEXITY_OPTIONS.map((level) => {
          const selected = news.complexity === level;
          return (
            <MenuItem
              key={level}
              data-testid={`news-complexity-option-${level}`}
              data-selected={selected ? 'true' : 'false'}
              onClick={handleComplexity(level)}
              selected={selected}
            >
              <Radio checked={selected} size="small" sx={{ mr: 1, p: 0 }} />
              <ListItemText primary={i18n._(NEWS_COMPLEXITY_LABELS[level])} />
            </MenuItem>
          );
        })}

        <Divider />

        <ListSubheader>{i18n._('Country')}</ListSubheader>
        {(() => {
          const autoSelected = news.countryOverride === null;
          return (
            <MenuItem
              key="auto"
              data-testid="news-country-option-auto"
              data-selected={autoSelected ? 'true' : 'false'}
              onClick={handleCountry(null)}
              selected={autoSelected}
            >
              <Radio checked={autoSelected} size="small" sx={{ mr: 1, p: 0 }} />
              <ListItemText primary={i18n._('Auto (account country)')} />
            </MenuItem>
          );
        })()}
        {NEWS_SUPPORTED_COUNTRIES.map((c) => {
          const selected = news.countryOverride === c.code;
          return (
            <MenuItem
              key={c.code}
              data-testid={`news-country-option-${c.code}`}
              data-selected={selected ? 'true' : 'false'}
              onClick={handleCountry(c.code)}
              selected={selected}
            >
              <Radio checked={selected} size="small" sx={{ mr: 1, p: 0 }} />
              <ListItemText primary={c.name} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
