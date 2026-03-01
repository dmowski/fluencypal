import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { ImageDescription, imageDescriptions } from '@/features/Game/ImagesDescriptions';
import { StoryPreview } from '@/features/Sentence/StoryPreview';
import { Story } from '@/features/Sentence/types';
import { useUrlState } from '@/features/Url/useUrlState';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { CirclePlus, Eye, Music, X } from 'lucide-react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { StoryEditorModal } from './StoryEditorModal';
import { useState } from 'react';
import { splitTextIntoSentences } from '@/features/Sentence/TextConstructor/splitTextIntoSentences';
import { uniq } from '@/libs/uniq';
import { splitWords } from '@/features/Sentence/TextConstructor/textConstructor.utils';
import { useAudioCache } from '@/features/Audio/useAudioCache';
import { SpeakOptions } from '@/features/Audio/useConversationAudio';
import { clearWordForAudio } from '@/features/Audio/clearWord';
import { getVoiceOverSpeakOptions } from '@/features/Audio/getVoiceOverSpeakOptions';
import { useTranslate } from '@/features/Translation/useTranslate';
import { SupportedLanguage } from '@/features/Lang/lang';
import { useStories } from '@/features/Sentence/useStories';

export const StoryCreator = () => {
  const auth = useAuth();
  const collectionRef = db.collections.stories(auth.uid);
  const [storiesDataRaw] = useCollectionData(collectionRef);

  const storiesDbData = [...(storiesDataRaw || [])];

  const [selectedStoryId, setSelectedStoryId] = useUrlState('selectedStory', '', false);

  const createNewStory = async () => {
    const isConfirmed = window.confirm('Are you sure you want to create a new story?');
    if (!isConfirmed) return;

    if (!collectionRef) return;
    const newId = Date.now().toString();
    const storyData: Story = {
      id: newId,
      title: '',
      imageUrl: '',
      textEn: '',
      subtitle: '',
      videoUrl: '',
      audioUrl: '',
      sunoPrompt: '',
      videoDescription: '',
      isPublished: false,
      storySystemInstruction: '',
      createdAtIso: new Date().toISOString(),
      updatedAtIso: new Date().toISOString(),
    };

    const docRef = doc(collectionRef, newId);
    await setDoc(docRef, storyData);
    setSelectedStoryId(newId);
  };

  const stories = useStories();

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
    await deleteDoc(docRef);
    setSelectedStoryId('');
  };

  const selectedStoryData = storiesDbData?.find((story) => story.id === selectedStoryId);

  const audioCache = useAudioCache();

  const translator = useTranslate();

  const translateTextToTargetLanguageFromEng = async (
    text: string,
    targetLanguage: SupportedLanguage,
  ) => {
    const translated = await translator.translateText({
      text: text,
      sourceLanguage: 'en',
      targetLanguage: targetLanguage,
    });
    return translated;
  };

  const [isCaching, setIsCaching] = useState(false);

  const cacheAllAudioForLang = async (targetLanguage: SupportedLanguage) => {
    setIsCaching(true);
    console.log('PROCESS ' + targetLanguage);

    const speakOptionsMain: SpeakOptions = getVoiceOverSpeakOptions(targetLanguage);

    const storiesRaw = storiesDbData || [];
    const stories = storiesRaw.sort((a, b) => {
      return b.updatedAtIso.localeCompare(a.updatedAtIso);
    });
    //.filter((story, index) => index <= 2);

    const isNeedToTranslate = targetLanguage !== 'en';

    const storiesTexts = !isNeedToTranslate
      ? stories.map((story) => story.textEn || '').filter(Boolean)
      : await Promise.all(
          stories.map(async (story) => {
            const textEn = story.textEn || '';
            if (!textEn) return '';
            const translated = await translateTextToTargetLanguageFromEng(textEn, targetLanguage);
            return translated;
          }),
        );

    console.log('storiesTexts', storiesTexts);

    const allStoriesTextSentences = storiesTexts
      .map((storyText) => splitTextIntoSentences(storyText))
      .flat();

    const allWords = uniq(allStoriesTextSentences.map((sentence) => splitWords(sentence)).flat());

    const uniqueWords = uniq(allWords.map((word) => clearWordForAudio(word) || '').filter(Boolean))
      .sort((a, b) => a.localeCompare(b))
      .reverse();

    console.log('uniqueWords');
    console.log(uniqueWords);

    await audioCache.cacheAudioWords(uniqueWords, speakOptionsMain);

    console.log(`DONE ${targetLanguage} caching all audios | `, new Date().toISOString());
    setIsCaching(false);
  };

  const cacheAllAudio = async () => {
    await cacheAllAudioForLang('en');
    await cacheAllAudioForLang('pl');
  };

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
          openNext={() => {
            const currentIndex =
              storiesDbData?.findIndex((story) => story.id === selectedStoryId) || 0;
            const nextStory = storiesDbData?.[currentIndex + 1];
            if (nextStory) {
              setSelectedStoryId(nextStory.id);
            } else {
              setSelectedStoryId('');
            }
          }}
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
        <Button onClick={cacheAllAudio} disabled={isCaching}>
          Cache all audios {isCaching ? '| Caching...' : ''}
        </Button>
      </Stack>

      <Stack>
        <Typography variant="h6">All stories ({storiesDbData?.length || 0}):</Typography>

        <Stack
          sx={{
            flexDirection: 'row',
            gap: 2,
            flexWrap: 'wrap',
            maxWidth: '100%',
          }}
        >
          {storiesDbData?.length === 0 && <Typography>No stories yet</Typography>}

          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '6px 15px 20px 7px',
              width: 'max-content',
              maxWidth: '100%',
              flexWrap: 'wrap',
            }}
          >
            {storiesDbData?.map((image) => {
              const isPublished = image.isPublished;
              const isAudio = image.audioUrl;
              return (
                <Stack
                  key={image.id}
                  sx={{
                    position: 'relative',
                  }}
                >
                  <StoryPreview
                    key={image.id}
                    onSelectImage={onSelectImage}
                    data={image}
                    stat={stories.storiesStatsMap[image.id]}
                  />

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
                    {!isPublished && <X size={'15px'} color="red" />}
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
                      data={image}
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
