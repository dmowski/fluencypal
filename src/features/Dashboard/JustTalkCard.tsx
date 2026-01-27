import { useLingui } from '@lingui/react';
import VideocamIcon from '@mui/icons-material/Videocam';

import { Typography, Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import { AudioLines } from 'lucide-react';
import { useTeacherSettings } from '../Conversation/CallMode/useTeacherSettings';
import { useAiConversation } from '../Conversation/useAiConversation';
import { useState } from 'react';
import { useSettings } from '../Settings/useSettings';
import { useConversationAudio } from '../Audio/useConversationAudio';

export const JustTalkCard = () => {
  const { i18n } = useLingui();

  const teacherSettings = useTeacherSettings();

  const conversation = useAiConversation();
  const [isCallStarting, setIsCallStarting] = useState(false);
  const settings = useSettings();
  const audio = useConversationAudio();

  const startJustTalk = async () => {
    audio.startConversationAudio();

    setIsCallStarting(true);
    await settings.setConversationMode('call');
    conversation.startConversation({
      conversationMode: 'call',
      mode: 'talk',
      voice: settings.userSettings?.teacherVoice || 'shimmer',
    });
  };

  return (
    <Stack
      sx={{
        marginBottom: '20px',
        alignItems: 'flex-start',
        gap: '30px',

        width: '100%',
        borderRadius: '16px',
        padding: '40px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        '@media (max-width:600px)': {
          borderRadius: '0px',
          padding: '40px 10px 60px 10px',
          backgroundColor: 'rgba(255, 255, 255, 0)',
          border: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.081)',
        },
      }}
    >
      <Stack
        sx={{
          gap: '10px',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: '800',
            textWrap: 'balance',
            '@media (max-width:600px)': {
              fontSize: '2rem',
              lineHeight: '2.2rem',
            },
          }}
        >
          {i18n._('Conversation with AI')}
        </Typography>
        <Typography
          sx={{
            opacity: 0.9,
            textWrap: 'balance',
          }}
        >
          {i18n._(
            "Start a casual call to practice your communication skills. This is a no-strings-attached conversation if you'd like to chat in a casual setting.",
          )}
        </Typography>
      </Stack>
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap',
        }}
      >
        <Button
          color="info"
          startIcon={<VideocamIcon />}
          onClick={startJustTalk}
          disabled={isCallStarting}
          variant="contained"
          sx={{
            padding: '10px 35px',
          }}
        >
          {i18n._('Start a call')}
        </Button>
        <Button
          size="small"
          color="primary"
          sx={{
            padding: '10px 15px',
          }}
          startIcon={<AudioLines size={'19px'} />}
          onClick={teacherSettings.openSettingsModal}
        >
          {i18n._('AI voice')}
        </Button>
      </Stack>
    </Stack>
  );
};
