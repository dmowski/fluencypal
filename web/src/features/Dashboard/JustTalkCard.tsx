import { useLingui } from '@lingui/react';
import VideocamIcon from '@mui/icons-material/Videocam';

import { Typography, Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import { AudioLines, Loader } from 'lucide-react';
import { useAiConversation } from '../Conversation/useAiConversation/useAiConversation';
import { useState } from 'react';
import { useSettings } from '../Settings/useSettings';
import { useConversationAudio } from '../Audio/useConversationAudio';
import { voiceAvatarMap } from '../Conversation/CallMode/voiceAvatar';
import { AudioPlayIcon } from '../Audio/AudioPlayIcon';
import { Avatar } from '../Game/Avatar';
import { getMediaAudioStreams, getMediaVideoStreams } from '../webCam/mediaStream';
import { sleep } from '@/libs/sleep';
import { StoreCard } from '../uiKit/Card/StoreCard';

export const JustTalkCard = () => {
  const { i18n } = useLingui();

  const settings = useSettings();
  const teacherSettings = settings.teacherSettings;

  const [footnotePhraseIndex, setFootnotePhraseIndex] = useState(new Date().getDate());

  const conversation = useAiConversation();
  const [isCallStarting, setIsCallStarting] = useState(false);
  const audio = useConversationAudio();
  const voiceName = settings.userSettings?.teacherVoice || 'shimmer';
  const startJustTalk = async () => {
    if (isCallStarting) return;
    await audio.initAudio();
    setIsCallStarting(true);

    /*
    try {
      //audio.music.stop();
      //audio.music.setVolume(0.5);
      await sleep(150);
      //audio.music.play('/audio/call_start_01.mp3');
      await sleep(150);
      setTimeout(() => {
        //audio.music.setVolume(0);
      }, 10000);
    } catch (e) {
      console.error('Error playing call start music', e);
    }
    */

    try {
      const mediaStream = await getMediaAudioStreams();
      if (!mediaStream) {
        throw new Error('Could not access microphone');
      }

      //await sleep(100);
      await getMediaVideoStreams();
    } catch (e) {
      console.warn('Microphone permission denied. error', e);
      alert(
        i18n._(
          `Microphone access is required to start the call.
Please allow microphone permission in your browser settings, refresh the page, and try again.`,
        ),
      );
      // window.location.reload();
      setIsCallStarting(false);
      return;
    }

    //await sleep(500);

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
  const secondPhotoUrl = aiAvatar.photoUrls?.[1] || aiAvatar.photoUrls?.[0] || '';

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <Stack>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
          }}
        >
          Speaking
        </Typography>
        <Typography
          variant="body1"
          sx={{
            opacity: 0.8,
          }}
        >
          {footnotePhrase}
        </Typography>
      </Stack>
      <StoreCard
        badge={'FLUENCY PRACTICE'}
        textColor={'#fff'}
        backgroundColor={'#0286D0'}
        borderSize={'5px'}
        previewImageUrl={aiAvatar.photoUrls?.[0] || ''}
        label={'JUST TALK MODE'}
        title={i18n._('Conversation with AI')}
        subTitle={i18n._(
          "Start a casual call to practice your communication skills. This is a no-strings-attached conversation if you'd like to chat in a casual setting.",
        )}
        items={[
          {
            title: voiceName.charAt(0).toUpperCase() + voiceName.slice(1),
            subTitle: i18n._('Your AI Speech Partner'),
            imageUrl: secondPhotoUrl,
            actionButtonTitle: i18n._('Start'),
            onClick: () => {
              startJustTalk();
            },
          },
        ]}
        itemsBackgroundColor={'rgba(0, 0, 0, 0.2)'}
        onClick={() => {
          startJustTalk();
        }}
        itemsViewMode={'list'}
      />
    </Stack>
  );

  /*
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
            startIcon={isCallStarting ? <Loader size={'20px'} /> : <VideocamIcon />}
            onClick={isCallStarting ? () => {} : startJustTalk}
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
        <Avatar url={aiAvatar.photoUrls?.[0] || ''} avatarSize={'50px'} />
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
        <AudioPlayIcon text={footnotePhrase} />
      </Stack>
    </Stack>
  );*/
};
