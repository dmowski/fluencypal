'use client';

import { CustomModal } from '../uiKit/Modal/CustomModal';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SelectTeacher } from '../Conversation/CallMode/SelectTeacher';
import { useSettings } from '../Settings/useSettings';
import { VoiceSpeedSelector } from '../Settings/VoiceSpeedSelector';
import { Check } from 'lucide-react';

export const TeacherVoiceModal: React.FC = () => {
  const { i18n } = useLingui();
  const settings = useSettings();
  const voiceSpeed = settings.aiVoiceSpeed;

  return (
    <>
      {settings.teacherSettings.isSettingsModalOpen && (
        <CustomModal isOpen={true} onClose={settings.teacherSettings.closeSettingsModal}>
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
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                }}
              >
                {i18n._('Your AI teacher voice:')}
              </Typography>
              <Typography
                sx={{
                  opacity: 0.7,
                }}
                variant="body2"
              >
                {i18n._('Select the voice your AI teacher will use during conversations.')}
              </Typography>
            </Stack>
            <VoiceSpeedSelector />
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
              onClick={settings.teacherSettings.closeSettingsModal}
            >
              {i18n._('Done')}
            </Button>
          </Stack>
        </CustomModal>
      )}
    </>
  );
};
