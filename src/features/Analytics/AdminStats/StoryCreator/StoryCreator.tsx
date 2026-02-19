import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { ImageDescription, imageDescriptions } from '@/features/Game/ImagesDescriptions';
import { StoryPreview } from '@/features/Sentence/StoryPreview';
import { Story } from '@/features/Sentence/types';
import { useUrlState } from '@/features/Url/useUrlState';
import { IconButton, Stack, Typography } from '@mui/material';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { CirclePlus } from 'lucide-react';
import { useCollection, useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { StoryEditorModal } from './StoryEditorModal';

export const StoryCreator = () => {
  const auth = useAuth();
  const collectionRef = db.collections.stories(auth.uid);
  const [storiesData] = useCollectionData(collectionRef);

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
    };

    const docRef = doc(collectionRef, newId);
    await setDoc(docRef, storyData);
    setSelectedStoryId(newId);
  };

  const updateStory = async (story: Story) => {
    if (!collectionRef) return;
    const docRef = doc(collectionRef, story.id);
    await setDoc(docRef, story);
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
  console.log('selectedStoryData', selectedStoryData);

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
                return <StoryPreview key={index} onSelectImage={onSelectImage} image={image} />;
              })}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
