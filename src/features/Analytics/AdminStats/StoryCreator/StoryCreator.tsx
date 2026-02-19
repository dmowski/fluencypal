import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { ImageDescription, imageDescriptions } from '@/features/Game/ImagesDescriptions';
import { StoryPreview } from '@/features/Sentence/StoryPreview';
import { Story } from '@/features/Sentence/types';
import { useUrlState } from '@/features/Url/useUrlState';
import { IconButton, Stack, Typography } from '@mui/material';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { CirclePlus, Eye, Music } from 'lucide-react';
import { useCollection, useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { StoryEditorModal } from './StoryEditorModal';

export const StoryCreator = () => {
  const auth = useAuth();
  const collectionRef = db.collections.stories(auth.uid);
  const [storiesDataRaw] = useCollectionData(collectionRef);

  const storiesData = [
    ...(storiesDataRaw || []).sort((a, b) => {
      return b.updatedAtIso.localeCompare(a.updatedAtIso);
    }),
  ];

  const [selectedStoryId, setSelectedStoryId] = useUrlState('selectedStory', '', false);

  const createNewStory = async () => {
    if (!collectionRef) return;
    const newId = Date.now().toString();
    const storyData: Story = {
      id: newId,
      title: '',
      imageUrl: '',
      textEn: '',
      subtitle: null,
      videoUrl: null,
      audioUrl: null,
      sunoPrompt: null,
      videoDescription: null,
      isPublished: false,
      storySystemInstruction: '',
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
    };

    const docRef = doc(collectionRef, newId);
    await setDoc(docRef, storyData);
    setSelectedStoryId(newId);
  };

  const createFromImageDescription = async (imageDescription: ImageDescription) => {
    if (!collectionRef) return;
    const newId = Date.now().toString();
    const storyData: Story = {
      id: newId,
      title: imageDescription.shortDescription,
      imageUrl: imageDescription.url,
      textEn: imageDescription.fullImageDescription,
      subtitle: null,
      videoUrl: null,
      audioUrl: null,
      sunoPrompt: null,
      videoDescription: null,
      isPublished: false,
      storySystemInstruction: '',
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
    };

    const docRef = doc(collectionRef, newId);
    await setDoc(docRef, storyData);
    setSelectedStoryId(newId);
  };

  const updateStory = async (story: Story) => {
    if (!collectionRef) return;
    const docRef = doc(collectionRef, story.id);
    await setDoc(docRef, {
      ...story,
      updatedAtIso: new Date().toISOString(),
      createdAtIso: story.createdAtIso || new Date().toISOString(),
    });
  };

  const onSelectImage = (id: string) => {
    setSelectedStoryId(id);
  };

  const deleteStory = async (story: Story) => {
    if (!collectionRef) return;
    const docRef = doc(collectionRef, story.id);
    deleteDoc(docRef);
    setSelectedStoryId('');
  };

  const selectedStoryData = storiesData?.find((story) => story.id === selectedStoryId);

  return (
    <Stack
      sx={{
        gap: '20px',
        padding: '20px',
      }}
    >
      {selectedStoryData && (
        <StoryEditorModal
          story={selectedStoryData}
          update={updateStory}
          deleteStory={deleteStory}
          onClose={() => setSelectedStoryId('')}
        />
      )}
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <Typography variant="h4">Story Creator</Typography>
        <IconButton onClick={createNewStory}>
          <CirclePlus />
        </IconButton>
      </Stack>

      <Stack>
        <Typography variant="h6">All stories:</Typography>

        <Stack
          sx={{
            flexDirection: 'row',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {storiesData?.length === 0 && <Typography>No stories yet</Typography>}

          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '6px 15px 20px 7px',
              width: 'max-content',
            }}
          >
            {storiesData?.map((image, index) => {
              const isPublished = image.isPublished;
              const isAudio = image.audioUrl;
              return (
                <Stack
                  key={index}
                  sx={{
                    position: 'relative',
                  }}
                >
                  <StoryPreview key={index} onSelectImage={onSelectImage} image={image} />

                  <Stack
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      color: '#fff',
                      padding: '4px 8px',
                      zIndex: 1,
                      borderRadius: '6px',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {isAudio && <Music size={'15px'} />}
                    {isPublished && <Eye size={'15px'} />}
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </Stack>

      <Stack
        sx={{
          width: '100%',
          flexWrap: 'wrap',
        }}
      >
        <Stack
          sx={{
            width: '100%',
          }}
        >
          <Typography variant="h6">Pictures:</Typography>

          <Stack
            sx={{
              flexDirection: 'row',
              gap: 2,
              width: '100%',
              flexWrap: 'wrap',
            }}
          >
            <Stack
              sx={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '6px 15px 20px 7px',
                flexWrap: 'wrap',
              }}
            >
              {imageDescriptions
                .filter((image) => image.isPaintingVersion)
                .map((image, index) => {
                  return (
                    <StoryPreview
                      key={index}
                      onSelectImage={(id) => createFromImageDescription(image)}
                      image={image}
                    />
                  );
                })}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
