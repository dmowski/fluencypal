'use client';

import { useMemo } from 'react';
import { useGame } from '../Game/useGame';
import { UserProfileModal } from '../Game/UserProfileModal';
import { useUsage } from '../Usage/useUsage';
import { SubscriptionPaymentModal } from '../Usage/SubscriptionPaymentModal';
import { useAuth } from '../Auth/useAuth';
import { useTeacherSettings } from '../Conversation/CallMode/useTeacherSettings';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { Button, Stack, Typography, Select, MenuItem, FormControl } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SelectTeacher } from '../Conversation/CallMode/SelectTeacher';
import { useSettings } from '../Settings/useSettings';
import { Check } from 'lucide-react';

export const TeacherVoiceModal: React.FC = () => {
  const game = useGame();
  const usage = useUsage();
  const auth = useAuth();
  const { i18n } = useLingui();
  const settings = useSettings();
  const teacherSettings = useTeacherSettings();
  const voiceSpeed = settings.aiVoiceSpeed;

  return (
    <>
      {teacherSettings.isSettingsModalOpen && (
        <CustomModal isOpen={true} onClose={teacherSettings.closeSettingsModal}>
          <Stack
            sx={{
              gap: '30px',
              width: '100%',
              maxWidth: '700px',
              padding: '20px 0px 30px 0px',
              alignItems: 'flex-start',
            }}
          >
            <Stack>
              <Typography variant="h5">{i18n._('Your AI teacher voice:')}</Typography>
              <Typography
                sx={{
                  opacity: 0.7,
                }}
                variant="body2"
              >
                {i18n._('Select the voice your AI teacher will use during conversations.')}
              </Typography>
            </Stack>
            <Stack>
              <Typography variant="caption">{i18n._('Voice speed')}</Typography>
              <FormControl fullWidth>
                <Select
                  value={voiceSpeed}
                  onChange={(e) => settings.setAiVoiceSpeed(e.target.value as any)}
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
            <SelectTeacher
              selectedVoice={settings.userSettings?.teacherVoice}
              onSelectVoice={settings.setVoice}
              voiceSpeed={voiceSpeed}
            />
            <Button
              size="large"
              color="info"
              variant="contained"
              startIcon={<Check />}
              onClick={teacherSettings.closeSettingsModal}
            >
              {i18n._('Done')}
            </Button>
          </Stack>
        </CustomModal>
      )}
    </>
  );
};
