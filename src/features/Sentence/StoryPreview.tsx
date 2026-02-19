import Stack from '@mui/material/Stack';
import Image from 'next/image';
import { Story } from './types';
import { ImageDescription } from '../Game/ImagesDescriptions';

export const StoryPreview = ({
  onSelectImage,
  image,
}: {
  onSelectImage: (id: string) => void;
  image: ImageDescription | Story;
}) => {
  const story: Story | null = 'textEn' in image ? image : null;
  const imageDescription: ImageDescription | null = 'textEn' in image ? null : image;

  const id = image.id;
  const title = story?.title || imageDescription?.shortDescription || '';
  const imageUrl = story?.imageUrl || imageDescription?.url || '';
  const videoUrl = story?.videoUrl;

  const isImageDescription = !!imageDescription;
  return (
    <Stack
      sx={{
        width: '130px',
        height: '200px',
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
            : 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)',
        },
        ':focus': {
          outline: 'none',
          boxShadow: '0 0 0 4px #111, 0 0 0 6px #278adc',
        },
      }}
      component={'button'}
      onClick={() => onSelectImage(id)}
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
    </Stack>
  );
};
