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
import { voiceAvatarMap } from '../Conversation/CallMode/voiceAvatar';
import { AiAvatarVideo } from '../Conversation/CallMode/AiAvatarVideo';
import { AudioPlayIcon } from '../Audio/AudioPlayIcon';

export const JustTalkCard = () => {
  const { i18n } = useLingui();

  const teacherSettings = useTeacherSettings();

  const [footnotePhraseIndex, setFootnotePhraseIndex] = useState(new Date().getDate());

  const conversation = useAiConversation();
  const [isCallStarting, setIsCallStarting] = useState(false);
  const settings = useSettings();
  const audio = useConversationAudio();
  const voiceName = settings.userSettings?.teacherVoice || 'shimmer';
  const startJustTalk = async () => {
    audio.startConversationAudio();

    setIsCallStarting(true);
    await settings.setConversationMode('call');
    conversation.startConversation({
      conversationMode: 'call',
      mode: 'talk',
      voice: voiceName,
    });
  };

  const aiAvatar = voiceAvatarMap[voiceName];

  const funnyPhrases = aiAvatar.funnyPhrases;
  const footnotePhrase = funnyPhrases[footnotePhraseIndex % funnyPhrases.length];

  return (
    <Stack
      sx={{
        marginBottom: '20px',
        alignItems: 'flex-start',
        gap: '30px',

        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        //padding: '40px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        '@media (max-width:600px)': {
          borderRadius: '0px',
          padding: '40px 0px 0px 0px',
          backgroundColor: 'rgba(255, 255, 255, 0)',
          border: 'none',
        },
      }}
    >
      <Stack
        sx={{
          gap: '30px',
          padding: '30px 30px 0 30px',
          '@media (max-width:600px)': {
            padding: '0px 20px 0 20px',
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

      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '5px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'max-content 1fr max-content',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0px',
          padding: '20px 30px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          '@media (max-width:600px)': {
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '15px 20px',
          },
        }}
      >
        <Stack
          sx={{
            width: '45px',
            height: '45px',
            position: 'relative',
            display: 'grid',
            borderRadius: '122px',
            overflow: 'hidden',
            placeItems: 'center',
          }}
        >
          <Stack
            component={'img'}
            src={aiAvatar.photoUrls?.[0] || ''}
            sx={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Stack>
        <Stack
          sx={{
            paddingLeft: '15px',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              fontWeight: '600',

              textTransform: 'capitalize',
            }}
          >
            {voiceName}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              textWrap: 'balance',
            }}
          >
            {footnotePhrase}
          </Typography>
        </Stack>
        <AudioPlayIcon
          text={footnotePhrase}
          voice={voiceName}
          instructions={aiAvatar.voiceInstruction}
        />
      </Stack>
    </Stack>
  );
};
