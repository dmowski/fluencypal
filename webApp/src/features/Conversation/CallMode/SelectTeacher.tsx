import { Stack, Typography } from '@mui/material';
import { voiceAvatarMap } from './voiceAvatar';
import { AiVoice } from '@/features/Ai/ai';
import { AiAvatarVideo } from './AiAvatarVideo';
import { AiAvatar } from './types';
import { TeacherPreviewButton } from './TeacherPreviewButton';
import { useState, useSyncExternalStore } from 'react';
import { shouldForceTeacherCardPhoto } from './teacherCardMedia';

const subscribeTeacherCardMedia = () => () => {};

const useForceTeacherCardPhoto = (): boolean =>
  useSyncExternalStore(
    subscribeTeacherCardMedia,
    () =>
      shouldForceTeacherCardPhoto({
        userAgent: navigator.userAgent,
        maxTouchPoints: navigator.maxTouchPoints ?? 0,
        platform: navigator.platform,
      }),
    () => false,
  );

export const SelectTeacher = ({
  selectedVoice,
  onSelectVoice,
}: {
  selectedVoice?: AiVoice | null;
  onSelectVoice: (voice: AiVoice) => void;
}) => {
  const voices = Object.keys(voiceAvatarMap) as AiVoice[];
  const forcePhoto = useForceTeacherCardPhoto();

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
            forcePhoto={forcePhoto}
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
  forcePhoto,
}: {
  voice: AiVoice;
  aiAvatar: AiAvatar;
  isSelected: boolean;
  onToggle: () => void;
  forcePhoto: boolean;
}) => {
  const [isPlayingThisVoice, setIsPlayingThisVoice] = useState(false);

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
        component="div"
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        aria-label={voice}
        data-analytics="teacher-select"
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggle();
          }
        }}
      >
        <Stack
          sx={{
            transform: 'scale(1.1)',
            width: '100%',
            height: '100%',
            backgroundColor: '#222',
            pointerEvents: 'none',
          }}
        >
          <AiAvatarVideo
            aiVideo={aiAvatar}
            isSpeaking={isPlayingThisVoice}
            isUsePhoto={forcePhoto}
          />
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
          top: '18px',
          left: '18px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderRadius: '50%',
          padding: '4px',
          transform: 'scale(1.3)',
        }}
      >
        <TeacherPreviewButton
          voice={voice}
          onPlayingChange={(isPlaying) => {
            setIsPlayingThisVoice(isPlaying);
            if (isPlaying && !isSelected) {
              onToggle();
            }
          }}
        />
      </Stack>
    </Stack>
  );
};
