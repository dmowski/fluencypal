import { useLingui } from '@lingui/react';
import { Button, ButtonGroup, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Image from 'next/image';
import { ImageDescription } from '../Game/ImagesDescriptions';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTextAi } from '../Ai/useTextAi';
import { useSettings } from '../Settings/useSettings';
import { useTranslate } from '../Translation/useTranslate';
import { splitTextIntoSentences } from './splitTextIntoSentences';
import { StoryContent, TextConstructor } from './TextConstructor';
import { Loader, Origami, RefreshCw, X } from 'lucide-react';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { SpeakOptions, useConversationAudio } from '../Audio/useConversationAudio';
import { getAiVoiceByVoice } from '../Conversation/CallMode/voiceAvatar';
import { useAuth } from '../Auth/useAuth';
import { increaseGamePointsRequest } from '../Game/gameBackendRequests';
import { Story } from './types';
import { useUrlState } from '../Url/useUrlState';
import { storyData } from './storyData';
import { getHash } from '@/libs/hash';
import { sleep } from '@/libs/sleep';
import { uniq } from '@/libs/uniq';
import { StoryPreview } from './StoryPreview';
import { db } from '../Firebase/firebaseDb';
import { useCollectionData, useDocumentData } from 'react-firebase-hooks/firestore';
import { getDoc, setDoc } from 'firebase/firestore';

export const TextConstructorStories = () => {
  const { i18n } = useLingui();
  const [selectedImageImageId, setSelectedImageId] = useUrlState('storyImage', '', false);

  const auth = useAuth();
  const collectionRef = db.collections.stories(auth.uid);
  const [databaseStories] = useCollectionData(collectionRef);

  const storiesViewsStatsDocRef = db.documents.storiesViewsStats(auth.uid);
  const [storiesViewsStats] = useDocumentData(storiesViewsStatsDocRef);

  const increaseViewsCount = async (storyId: string) => {
    if (!auth.uid || !storiesViewsStatsDocRef) return;
    const newestDoc = getDoc(storiesViewsStatsDocRef);
    const newestData = (await newestDoc).data() || {};
    const currentCount = newestData[storyId] || 0;
    const newCount = currentCount + 1;

    await setDoc(storiesViewsStatsDocRef, { [storyId]: newCount }, { merge: true });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (selectedImageImageId) {
        increaseViewsCount(selectedImageImageId);
      }
    }, 4000);

    return () => clearTimeout(timeout);
  }, [selectedImageImageId]);

  const storiesToShow = useMemo(() => {
    if (!databaseStories) return [];
    const allElements = [...(databaseStories || []), ...storyData];
    const publishedStories = allElements.filter((s) => s.isPublished);

    const sortedByDate = publishedStories.sort((a, b) => {
      return b.updatedAtIso.localeCompare(a.updatedAtIso);
    });

    return sortedByDate;
  }, [databaseStories]);

  const selectedStory = storiesToShow.find((img) => img.id === selectedImageImageId) || null;

  const closeStory = () => {
    setSelectedImageId('');
    audio.music.stop();
  };

  const playStoryAudio = async (story?: Story | null) => {
    if (!story || !story.audioUrl) {
      return;
    }
    const audioUrl = story.audioUrl;
    await sleep(500);
    audio.music.play(audioUrl);
    audio.music.setVolume(0.1);
  };

  const onNext = async () => {
    const currentIndex = storiesToShow.findIndex((img) => img.id === selectedImageImageId);
    const nextIndex = (currentIndex + 1) % storiesToShow.length;
    const nextImage = storiesToShow[nextIndex];
    setSelectedImageId(nextImage.id);

    audio.music.stop();

    playStoryAudio(nextImage);
  };

  const audio = useConversationAudio();

  const onSelectImage = async (imageId: string) => {
    setSelectedImageId(imageId);
    await audio.initAudio();
    const story = storiesToShow.find((s) => s.id === imageId);
    playStoryAudio(story);
  };

  return (
    <Stack
      sx={{
        alignItems: 'flex-start',
        gap: '0px',
        marginTop: '20px',

        width: '100%',
        position: 'relative',
      }}
    >
      {selectedStory && <StoryModal data={selectedStory} onClose={closeStory} onNext={onNext} />}
      <Stack
        sx={{
          width: '100%',
          justifyContent: 'space-between',
          flexDirection: 'row',
          padding: '5px 10px 0px 10px',
          flexWrap: 'wrap',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            opacity: 0.8,
          }}
        >
          {i18n._('Expand vocabulary with stories')}
        </Typography>
      </Stack>

      <Stack
        sx={{
          position: 'relative',
          width: '99%',
          overflow: 'hidden',
          height: 'calc(100% + 20px)',
        }}
      >
        <Stack
          sx={{
            overflowX: 'scroll',
            paddingBottom: '15px',
            paddingRight: '10px',

            // Scrollbar styles
            '&::-webkit-scrollbar': {
              height: '0px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(100, 100, 100, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: 'rgba(100, 100, 100, 0.1)',
            },
          }}
        >
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '6px 15px 20px 7px',
              width: 'max-content',
              minHeight: '220px',
            }}
          >
            {storiesToShow.map((story, index) => {
              return (
                <StoryPreview
                  key={index}
                  onSelectImage={onSelectImage}
                  image={story}
                  views={storiesViewsStats?.[story.id]}
                />
              );
            })}
          </Stack>
        </Stack>

        <Stack
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            width: '80px',
            height: '100%',
            position: 'absolute',
            zIndex: 122,
            top: 0,
            color: '#fff',
            right: '-2px',
            border: 'none',
            background:
              'linear-gradient(90deg, rgba(10, 18, 30, 0.1) 0%, rgba(10, 18, 30, 1) 90%, rgba(10, 18, 30, 1) 100%)',
            cursor: 'pointer',
          }}
        ></Stack>
      </Stack>
    </Stack>
  );
};

const StoryModal = ({
  data,

  onClose,
  onNext,
}: {
  data: ImageDescription | Story;

  onClose: () => void;
  onNext: () => void;
}) => {
  const [progress, setProgress] = useState('');
  const ai = useTextAi();
  const auth = useAuth();

  const settings = useSettings();
  const storyText = 'textEn' in data ? data.textEn : '';
  const wordsCount = storyText.split(' ').length;

  const targetLanguage = settings.languageCode;
  const nativeLanguage = settings.userSettings?.nativeLanguageCode;

  const voiceName = settings.userSettings?.teacherVoice || 'shimmer';
  const voiceInfo = getAiVoiceByVoice(voiceName);
  const voiceSpeed = settings.userSettings?.teacherVoiceSpeed || 'normal';
  const videoUrl = 'videoUrl' in data ? data.videoUrl : undefined;
  const { i18n } = useLingui();

  const subtitleData = 'subtitle' in data ? data.subtitle : undefined;
  const subtitle = subtitleData || i18n._(`Press the button below to start the adventure!`);

  const [sentences, setSentences] = useState<string[]>([]);
  const [sentencesTranslates, setSentencesTranslates] = useState<string[]>([]);

  const userTargetLanguage = settings.fullLanguageName;
  const [isCompleted, setIsCompleted] = useState(false);
  const onComplete = () => {
    setIsCompleted(true);
  };

  const audio = useConversationAudio();
  type Mode = 'easy' | 'medium' | 'hard';
  const [mode, setMode] = useState<Mode>('easy');
  const numberOfOptionsMap: Record<Mode, number> = {
    easy: 2,
    medium: 3,
    hard: 4,
  };
  const pointsToWinMap: Record<Mode, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
  };
  const pointsToWin = pointsToWinMap[mode];

  const numberOfOptions = numberOfOptionsMap[mode];

  useEffect(() => {
    setProgress('');
    setSentences([]);
    setSentencesTranslates([]);
    setIsCompleted(false);
  }, [data]);

  const translator = useTranslate();

  const isTranslateAvailable = translator.isTranslateAvailable;

  const generateTextBasedOnImage = async (image: ImageDescription) => {
    const prompt = `Write a short story in ${userTargetLanguage} based on the following image description: ${image.fullImageDescription}. The story should be around 120 words and suitable for language learners.`;
    const generatedText = await ai.generate({
      userMessage: prompt,
      systemMessage: `You are a helpful assistant for language learners. Generate engaging and simple stories based on image descriptions. The story should be in ${userTargetLanguage} and should be easy to understand for someone learning the language. Avoid complex vocabulary and grammar structures, and focus on creating a clear and enjoyable narrative that helps learners practice their reading skills.`,
      model: 'gpt-4o',
      cache: true,
    });
    return generatedText;
  };

  const translateSentence = async (sentence: string) => {
    const isTargetLanguageTheSameAsUserLanguage = targetLanguage === nativeLanguage;
    if (!isTranslateAvailable || isTargetLanguageTheSameAsUserLanguage) {
      const maskedText = sentence.replace(/\w/g, '*');
      return maskedText;
    }

    const translated = await translator.translateText({
      text: sentence,
    });
    return translated;
  };

  const translateTextToTargetLanguageFromEng = async (text: string) => {
    const translated = await translator.translateText({
      text: text,
      sourceLanguage: 'en',
      targetLanguage: targetLanguage,
    });
    return translated;
  };

  const [initializing, setInitializing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const isStory = 'imageUrl' in data;
  const imageUrl = isStory ? data.imageUrl : data.url;
  const title = isStory ? data.title : data.shortDescription;

  const initialize = async () => {
    setInitializing(true);
    audio.initAudio();

    if (isStory) {
      const fullTextEn = data.textEn;
      const isNeedToTranslate = targetLanguage !== 'en';
      const fullText = isNeedToTranslate
        ? await translateTextToTargetLanguageFromEng(fullTextEn)
        : fullTextEn;
      const sentences = splitTextIntoSentences(fullText);
      const translatedSentencesToNative = await Promise.all(
        sentences.map((s) => translateSentence(s)),
      );

      setSentences(sentences);
      setSentencesTranslates(translatedSentencesToNative);
      setIsReady(true);
      setInitializing(false);

      if (data.audioUrl && !audio.music.isPlaying) {
        const audioUrl = data.audioUrl;
        await sleep(500);
        audio.music.play(audioUrl);
        audio.music.setVolume(0.1);
      }
    } else {
      const imageDescription = data;
      const generatedText = await generateTextBasedOnImage(imageDescription);

      const story: Story = {
        id: `story-${imageDescription.id}`,
        title: imageDescription.shortDescription,
        imageUrl: imageDescription.url,
        textEn: generatedText,
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

      console.log(JSON.stringify(story));

      const translatedSentences = await Promise.all(sentences.map((s) => translateSentence(s)));

      setSentences(sentences);
      setSentencesTranslates(translatedSentences);
      setIsReady(true);
      setInitializing(false);
    }
  };

  const imageBg = (
    <Image
      src={imageUrl}
      alt="Today's image"
      fill
      sizes="1200px"
      style={{
        objectFit: 'cover',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    />
  );

  const isCachingMap = useRef<Record<string, boolean>>({});

  const voiceInstruction =
    targetLanguage === 'en' || !targetLanguage ? '' : `Use a ${userTargetLanguage} language`;

  const speakOptionsMain: SpeakOptions = {
    instructions: voiceInstruction,
    voice: 'marin',
    cache: true,
  };

  const speakOptionsAlternative: SpeakOptions = {
    instructions: voiceInstruction,
    voice: 'shimmer',
    cache: true,
  };

  const cacheAudioWords = async (words: string[]) => {
    const wordsHash = getHash(words.join(' '));
    const isCaching = isCachingMap.current[wordsHash];
    if (isCaching) {
      return;
    }
    isCachingMap.current[wordsHash] = true;

    await Promise.all([words.map((word, index) => audio.initCache(word, speakOptionsMain))]);
  };

  const playAudio = (text: string, alternativeVoice: boolean) => {
    audio.speak(text, alternativeVoice ? speakOptionsAlternative : speakOptionsMain);
  };

  const onSentenceComplete = async () => {
    if (!auth.uid) return;

    await increaseGamePointsRequest(
      {
        sentenceConstructor: {
          userId: auth.uid,
          points: pointsToWin,
        },
      },
      await auth.getToken(),
    );
  };

  const [allWords, setAllWords] = useState<string[]>([]);
  const [badWords, setBadWords] = useState<string[]>([]);

  const successRate =
    allWords.length > 0
      ? Math.round(((allWords.length - badWords.length) / allWords.length) * 100)
      : 0;

  const onWordSelected = (word: string) => {
    setAllWords((prev) => uniq([...prev, word]));
  };

  const onBadWord = (word: string) => {
    setBadWords((prev) => uniq([...prev, word]));
  };

  const [translationWords, setTranslationWords] = useState<string[]>([]);
  const onTranslationWord = (word: string) => {
    setTranslationWords((prev) => uniq([...prev, word]));
  };

  const attentionWords = uniq([...badWords, ...translationWords]);

  return (
    <CustomModal isOpen={true} onClose={onClose}>
      {translator.translateModal}
      <Stack
        sx={{
          position: 'fixed',
          width: '100dvw',
          height: '100dvh',
          top: 0,
          left: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack
          sx={{
            width: '100%',
            padding: '0',
            height: '100dvh',
            position: 'relative',
          }}
        >
          {(!isReady || initializing) && (
            <Stack>
              <Stack
                sx={{
                  width: '100%',
                  position: 'relative',
                  height: '100dvh',
                }}
              >
                {imageBg}
                <Stack
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    gap: '20px',
                    padding: '0px 10px',
                    bottom: 0,
                    alignItems: 'center',
                    zIndex: 2,
                    justifyContent: 'center',
                    background:
                      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)',
                  }}
                >
                  <Stack
                    sx={{
                      gap: '10px',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant="h3"
                      textAlign={'center'}
                      sx={{
                        fontWeight: 800,
                        maxWidth: '850px',
                        textWrap: 'balance',
                        fontSize: '72px',
                        '@media (max-width: 700px)': {
                          fontSize: '52px',
                        },
                        '@media (max-width: 500px)': {
                          fontSize: '42px',
                        },
                        '@media (max-width: 400px)': {
                          fontSize: '32px',
                        },
                      }}
                    >
                      {title}
                    </Typography>

                    <Typography variant="body2" textAlign={'center'}>
                      {subtitle}
                    </Typography>

                    {wordsCount && (
                      <Typography
                        variant="caption"
                        textAlign={'center'}
                        sx={{
                          opacity: 0.8,
                        }}
                      >
                        {i18n._('{wordsCount} words', { wordsCount: wordsCount })}
                      </Typography>
                    )}
                  </Stack>
                  <Stack
                    sx={{
                      gap: '20px',
                      alignItems: 'center',
                    }}
                  >
                    <ButtonGroup
                      sx={{
                        marginBottom: '0px',
                      }}
                    >
                      <Button
                        size="small"
                        variant={mode === 'easy' ? 'contained' : 'outlined'}
                        onClick={() => setMode('easy')}
                      >
                        {i18n._('Easy')}
                      </Button>
                      <Button
                        size="small"
                        variant={mode === 'medium' ? 'contained' : 'outlined'}
                        onClick={() => setMode('medium')}
                      >
                        {i18n._('Medium')}
                      </Button>
                      <Button
                        size="small"
                        variant={mode === 'hard' ? 'contained' : 'outlined'}
                        onClick={() => setMode('hard')}
                      >
                        {i18n._('Hard')}
                      </Button>
                    </ButtonGroup>
                    <Button
                      sx={{
                        padding: '15px 45px',
                        fontSize: '18px',
                      }}
                      variant="contained"
                      color="info"
                      onClick={() => {
                        if (initializing) return;
                        initialize();
                      }}
                      endIcon={initializing ? <Loader size={'20px'} /> : <Origami size={'20px'} />}
                    >
                      {initializing ? i18n._('Preparing...') : i18n._('Read')}
                    </Button>

                    <Button
                      sx={{
                        padding: '10px 30px',
                        color: '#fff',
                      }}
                      variant="text"
                      color="info"
                      onClick={() => {
                        if (initializing) return;
                        onNext();
                      }}
                      endIcon={<RefreshCw size={'20px'} />}
                    >
                      {i18n._('Next story')}
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          )}

          {isReady && !initializing && (
            <Stack
              sx={{
                position: 'relative',
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stack
                sx={{
                  width: '100%',
                  height: '100%',
                  padding: '0',
                }}
              >
                {!isCompleted && (
                  <TextConstructor
                    numberOfOptions={numberOfOptions}
                    sentences={sentences}
                    sentencesTranslates={sentencesTranslates}
                    progress={progress}
                    onContinue={setProgress}
                    onComplete={onComplete}
                    onSentenceComplete={onSentenceComplete}
                    onPlayAudio={playAudio}
                    onActiveWordsChange={cacheAudioWords}
                    onGoodWord={onWordSelected}
                    onBadWord={onBadWord}
                    onTranslationWord={onTranslationWord}
                  />
                )}

                {isCompleted && (
                  <Stack
                    sx={{
                      alignItems: 'center',
                      height: '100%',
                      overflow: 'scroll',
                      paddingBottom: '120px',
                    }}
                  >
                    <Stack
                      sx={{
                        width: '100%',
                        alignItems: 'flex-start',
                        gap: '10px',
                        maxWidth: '700px',
                        padding: '0 10px',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          marginTop: '60px',
                        }}
                      >
                        {i18n._('Well done! You completed the story.')}
                      </Typography>

                      <Stack
                        sx={{
                          gap: '80px',
                          width: '100%',
                          alignItems: 'flex-start',
                        }}
                      >
                        {videoUrl && (
                          <Stack
                            sx={{
                              maxWidth: '100%',
                            }}
                          >
                            <Stack
                              component={'video'}
                              src={videoUrl}
                              controls
                              sx={{
                                width: '100%',
                                boxShadow: '0px 4px 22px rgba(0, 0, 0, 0.9)',
                                maxWidth: '500px',
                                margin: '0 auto',
                                borderRadius: '8px',
                              }}
                            />
                          </Stack>
                        )}

                        <Stack
                          sx={{
                            padding: '0 0',
                          }}
                        >
                          <Stack sx={{}}>
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 800,
                              }}
                            >
                              {i18n._('Success rate:')}
                            </Typography>
                            <Typography
                              variant="h1"
                              sx={{
                                fontWeight: 700,
                              }}
                            >
                              {successRate}%
                            </Typography>
                          </Stack>
                        </Stack>

                        <Stack
                          sx={{
                            gap: '10px',
                          }}
                        >
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 800,
                            }}
                          >
                            {i18n._('Words to pay attention to:')}
                          </Typography>

                          <Stack
                            sx={{
                              flexDirection: 'row',
                              gap: '15px',
                              flexWrap: 'wrap',
                            }}
                          >
                            {attentionWords.map((word, index) => (
                              <Typography
                                key={index}
                                variant="h5"
                                sx={{
                                  padding: '10px 20px',
                                  backgroundColor: '#111',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  textTransform: 'capitalize',
                                  boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.4)',
                                }}
                                onClick={(e) => {
                                  playAudio(word, false);
                                  if (translator.isTranslateAvailable) {
                                    translator.translateWithModal(word, e.currentTarget);
                                  }
                                }}
                              >
                                {word}
                              </Typography>
                            ))}
                          </Stack>
                        </Stack>

                        <Stack
                          sx={{
                            gap: '10px',
                          }}
                        >
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 800,
                            }}
                          >
                            {i18n._('Full story:')}
                          </Typography>

                          <StoryContent
                            text={progress}
                            size="normal"
                            onPlayAudio={(text) => playAudio(text, false)}
                          />
                        </Stack>
                      </Stack>

                      <Stack
                        sx={{
                          flexDirection: 'row',
                          gap: '10px',
                          alignItems: 'center',
                          width: '100%',
                          padding: '30px 0px 0 0px',
                        }}
                      >
                        <Button
                          variant="contained"
                          color="info"
                          sx={{
                            padding: '10px 30px',
                          }}
                          onClick={() => onNext()}
                          endIcon={<Origami size={'20px'} />}
                        >
                          {i18n._('Try another story')}
                        </Button>
                        <Button
                          variant="text"
                          color="info"
                          sx={{
                            padding: '10px 30px',
                            color: '#fff',
                          }}
                          onClick={() => onClose()}
                          endIcon={<X size={'20px'} />}
                        >
                          {i18n._('Close')}
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                )}
              </Stack>
              <Stack
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: -1,
                  pointerEvents: 'none',
                  opacity: 1,
                }}
              >
                <Stack
                  sx={{
                    opacity: 1,
                  }}
                >
                  {imageBg}
                </Stack>
                <Stack
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    opacity: isCompleted ? 1 : 0.4,
                    background:
                      'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgb(5, 10, 17) 100%)',
                  }}
                />
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
    </CustomModal>
  );
};
