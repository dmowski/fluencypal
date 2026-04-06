'use client';

import { FormControl, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useSettings } from './useSettings';
import { AiVoiceSpeed } from './userSettings';

export const VoiceSpeedSelector: React.FC = () => {
  const { i18n } = useLingui();
  const settings = useSettings();

  return (
    <Stack>
      <Typography variant="caption">{i18n._('Voice speed')}</Typography>
      <FormControl fullWidth>
        <Select
          value={settings.aiVoiceSpeed}
          onChange={(e) => settings.setAiVoiceSpeed(e.target.value as AiVoiceSpeed)}
          sx={{
            minWidth: '200px',
          }}
        >
          <MenuItem value="extremely-slow">{i18n._('Extra Slow')}</MenuItem>
          <MenuItem value="slow">{i18n._('Slow')}</MenuItem>
          <MenuItem value="normal">{i18n._('Normal')}</MenuItem>
          <MenuItem value="fast">{i18n._('Fast')}</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
};
