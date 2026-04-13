import { useEffect, useState } from 'react';
import { AiAvatar } from './types';
import { Stack } from '@mui/material';

export const AiAvatarVideo = ({
  aiVideo,
  isSpeaking,
  isUsePhoto,
  photoIndex,
}: {
  aiVideo: AiAvatar;
  isSpeaking: boolean;
  isUsePhoto?: boolean;
  photoIndex?: number;
}) => {
  const [sitIndex, setSitIndex] = useState(0);
  const [talkIndex, setTalkIndex] = useState(0);

  useEffect(() => {
    if (isSpeaking) {
      const nextSitIndex = (sitIndex + 1) % aiVideo.sitVideoUrl.length;
      setSitIndex(nextSitIndex);
    } else {
      const nextTalkIndex = (talkIndex + 1) % aiVideo.talkVideoUrl.length;
      setTalkIndex(nextTalkIndex);
    }
  }, [isSpeaking]);

  const isPhotoMode = isUsePhoto && aiVideo.photoUrls && aiVideo.photoUrls.length > 0;

  const activePhotoIndex = photoIndex
    ? photoIndex % (aiVideo.photoUrls ? aiVideo.photoUrls.length : 1)
    : 0;

  if (isPhotoMode && aiVideo.photoUrls) {
    return (
      <Stack
        component={'img'}
        src={aiVideo.photoUrls[activePhotoIndex]}
        sx={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    );
  }

  return (
    <>
      {aiVideo.sitVideoUrl.map((url, index) => {
        const isActive = index === sitIndex;
        return (
          <Stack
            component={'video'}
            key={url}
            src={url}
            sx={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isActive ? 1 : 0,
            }}
            autoPlay
            controls={false}
            muted
            loop
            playsInline
          />
        );
      })}

      {aiVideo.talkVideoUrl.map((url, index) => {
        const isActive = index === talkIndex;
        return (
          <Stack
            component={'video'}
            key={url}
            src={url}
            sx={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isSpeaking && isActive ? 1 : 0,
              transition: 'opacity 0.4s ease-in-out',
            }}
            autoPlay
            controls={false}
            muted
            loop
            playsInline
          />
        );
      })}
    </>
  );
};
