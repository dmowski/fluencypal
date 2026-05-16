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
  NEWS_TOPIC_LABELS,
  NEWS_TOPIC_OPTIONS,
} from './constants';
import type { NewsLanguageComplexity, NewsTopic } from './types';
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

  const handleTopic = (next: NewsTopic) => () => {
    news.setTopic(next);
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
          paper: { sx: { minWidth: 220 } },
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

        <ListSubheader>{i18n._('Topic')}</ListSubheader>
        {NEWS_TOPIC_OPTIONS.map((t) => {
          const selected = news.topic === t;
          return (
            <MenuItem
              key={t}
              data-testid={`news-topic-option-${t}`}
              data-selected={selected ? 'true' : 'false'}
              onClick={handleTopic(t)}
              selected={selected}
            >
              <Radio checked={selected} size="small" sx={{ mr: 1, p: 0 }} />
              <ListItemText primary={i18n._(NEWS_TOPIC_LABELS[t])} />
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};
