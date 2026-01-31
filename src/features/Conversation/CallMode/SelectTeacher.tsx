import { Stack, Typography } from '@mui/material';
import { voiceAvatarMap } from './voiceAvatar';
import { AiVoice } from '@/common/ai';
import { AiAvatarVideo } from './AiAvatarVideo';
import { AiAvatar } from './types';
import { AudioPlayIcon } from '@/features/Audio/AudioPlayIcon';
import { useConversationAudio } from '@/features/Audio/useConversationAudio';
import { useState } from 'react';
import { AiVoiceSpeed } from '@/common/userSettings';
import { getVoiceSpeedInstruction } from './voiceSpeed';

export const SelectTeacher = ({
  selectedVoice,
  onSelectVoice,
  voiceSpeed,
}: {
  selectedVoice?: AiVoice | null;
  onSelectVoice: (voice: AiVoice) => void;
  voiceSpeed: AiVoiceSpeed;
}) => {
  const voices = Object.keys(voiceAvatarMap) as AiVoice[];

  return (
    <Stack
      sx={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        aspectRatio: '4 / 3',
        gap: '15px',
        '@media (max-width:600px)': {
          aspectRatio: '3 / 3',
        },
      }}
    >
      {voices.map((voice) => {
        const aiAvatar = voiceAvatarMap[voice];
        const isSelected = selectedVoice === voice;
        return (
          <AvatarCard
            key={voice}
            aiAvatar={aiAvatar}
            isSelected={isSelected}
            onToggle={() => onSelectVoice(voice)}
            voice={voice}
            voiceSpeed={voiceSpeed}
          />
        );
      })}
    </Stack>
  );
};

export const AvatarCard = ({
  aiAvatar,
  isSelected,
  onToggle,
  voice,
  voiceSpeed,
}: {
  voice: AiVoice;
  aiAvatar: AiAvatar;
  isSelected: boolean;
  onToggle: () => void;
  voiceSpeed: AiVoiceSpeed;
}) => {
  const audio = useConversationAudio();
  const [isPlayingThisVoice, setIsPlayingThisVoice] = useState(false);

  const voiceInstructionWithSpeed = `${getVoiceSpeedInstruction(voiceSpeed)} ${aiAvatar.voiceInstruction} `;
  if (isPlayingThisVoice) console.log('voiceInstructionWithSpeed', voiceInstructionWithSpeed);
  return (
    <Stack
      sx={{
        position: 'relative',
        padding: '4px',
      }}
    >
      <Stack
        sx={{
          boxShadow: isSelected
            ? '0px 0px 0px 4px rgba(0, 0, 0, 1), 0px 0px 0px 7px rgba(0, 185, 252, 1)'
            : '0px 0px 0px 1px rgb(51, 51, 51, 0)',
          borderRadius: isSelected ? '3px' : 0,
          overflow: 'hidden',
          cursor: 'pointer',
          width: '100%',
          height: '100%',
          position: 'relative',
          border: 'none',
        }}
        component={'button'}
        onClick={onToggle}
      >
        <Stack
          sx={{
            transform: 'scale(1.1)',
            width: '100%',
            height: '100%',
            backgroundColor: '#222',
          }}
        >
          <AiAvatarVideo aiVideo={aiAvatar} isSpeaking={audio.isPlaying && isPlayingThisVoice} />
        </Stack>
      </Stack>

      <Stack
        sx={{
          position: 'absolute',
          bottom: '10px',
          left: '15px',
          textTransform: 'capitalize',
        }}
      >
        <Typography variant="body2">{voice}</Typography>
      </Stack>

      <Stack
        sx={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderRadius: '50%',
          padding: '4px',
        }}
      >
        <AudioPlayIcon
          text={aiAvatar.helloPhrases[0]}
          voice={voice}
          instructions={voiceInstructionWithSpeed}
          onChangeState={setIsPlayingThisVoice}
        />
      </Stack>
    </Stack>
  );
};
