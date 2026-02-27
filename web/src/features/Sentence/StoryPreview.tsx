import Stack from '@mui/material/Stack';
import Image from 'next/image';
import { Story } from './types';
import { ImageDescription } from '../Game/ImagesDescriptions';
import { CircleCheck, Eye } from 'lucide-react';
import { Typography } from '@mui/material';
import { useMemo } from 'react';
import { getStoryHash } from './getStoryHash';
import { useAuth } from '../Auth/useAuth';
import { db } from '../Firebase/firebaseDb';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useSettings } from '../Settings/useSettings';

export const StoryPreview = ({
  onSelectImage,
  data,
}: {
  onSelectImage?: (id: string) => void;
  data: ImageDescription | Story;
}) => {
  const auth = useAuth();
  const settings = useSettings();
  const story: Story | null = 'textEn' in data ? data : null;
  const imageDescription: ImageDescription | null = 'textEn' in data ? null : data;

  const storiesViewsStatsDocRef = db.documents.storyStats(auth.uid, story?.id);
  const [storiesViewsStats] = useDocumentDataOnce(storiesViewsStatsDocRef);

  const views = storiesViewsStats?.viewsUserIds.length || 0;

  const targetLanguage = settings.languageCode || 'en';
  const nativeLanguage = settings.userSettings?.nativeLanguageCode || 'en';

  const storyHash = useMemo(() => {
    if (story) {
      return getStoryHash(story, targetLanguage, nativeLanguage);
    }
    return null;
  }, [story, targetLanguage, nativeLanguage]);

  const readProgress = db.documents.storyReadProgress(auth.uid, storyHash || '');

  const [progressData] = useDocumentDataOnce(readProgress);
  const isActive = !!progressData?.progress.length;
  const isCompleted = progressData?.isCompleted;

  const id = data.id;
  const title = story?.title || imageDescription?.shortDescription || '';
  const imageUrl = story?.imageUrl || imageDescription?.url || '';
  const videoUrl = story?.videoUrl;
  const isImageDescription = !!imageDescription;

  const progressPercent = useMemo(() => {
    const fullText = progressData?.sentences.join(' ').length || 0;
    const doneLength = progressData?.progress.length || 0;
    return fullText && doneLength ? Math.floor((doneLength / fullText) * 100) : 0;
  }, [progressData]);

  return (
    <Stack
      sx={{
        width: '130px',
        aspectRatio: '130 / 200',
        position: 'relative',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        borderRadius: '8px',
        ':after': {
          content: '""',
          position: 'absolute',
          pointerEvents: 'none',
          inset: 0,
          zIndex: 2,
          borderRadius: '8px',
          boxShadow: isImageDescription
            ? 'inset 0px 0px 0px 2px rgba(220, 0, 37, 0.7)'
            : 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.2)',
        },
        ':focus': {
          outline: 'none',
          boxShadow: '0 0 0 4px #111, 0 0 0 6px #278adc',
        },
        '@media (max-width:400px)': {
          width: '90px',
        },
      }}
      component={'button'}
      disabled={!onSelectImage}
      onClick={() => onSelectImage?.(id)}
    >
      {videoUrl && (
        <Stack
          component={'video'}
          autoPlay
          loop
          playsInline
          controls={false}
          muted
          sx={{
            height: '100%',
            width: '100%',
            borderRadius: '8px',
            position: 'absolute',
            top: 0,
            left: 0,
            objectFit: 'cover',
            zIndex: 1,
          }}
          src={videoUrl}
        />
      )}

      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes="300px"
        style={{
          objectFit: 'cover',
          borderRadius: '8px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
        }}
      />

      {views !== undefined && (
        <Stack
          sx={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            color: '#fff',
            padding: '2px 7px',
            borderRadius: '12px',
            fontSize: '12px',
            zIndex: 3,
            flexDirection: 'row',
            alignItems: 'center',
            gap: '6px',
            opacity: 0.8,
            height: '20px',
          }}
        >
          <Eye size={11} />
          <Typography variant="caption">{views}</Typography>
        </Stack>
      )}

      {isActive && (
        <Stack
          sx={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            color: '#fff',
            padding: '3px 8px 3px 7px',
            borderRadius: '22px',
            fontSize: '12px',
            zIndex: 3,
            flexDirection: 'row',
            alignItems: 'center',
            gap: '6px',
            opacity: 0.8,
          }}
        >
          {isCompleted ? (
            <CircleCheck size={'16px'} color="#33e84b" />
          ) : (
            <BookmarkIcon fontSize="small" sx={{ color: '#33c1e8', fontSize: '16px' }} />
          )}
          <Typography variant="caption">{`${progressPercent}%`}</Typography>
        </Stack>
      )}
    </Stack>
  );
};
