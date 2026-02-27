import { useLingui } from '@lingui/react';
import { Button, ButtonGroup, IconButton, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSettings } from '../Settings/useSettings';
import { useTranslate } from '../Translation/useTranslate';
import { splitTextIntoSentences } from './TextConstructor/splitTextIntoSentences';
import { StoryContent, TextConstructor } from './TextConstructor/TextConstructor';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Loader,
  Music,
  Origami,
  Pause,
  Play,
  RefreshCw,
  Video,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { SpeakOptions, useConversationAudio } from '../Audio/useConversationAudio';
import { useAuth } from '../Auth/useAuth';
import { increaseGamePointsRequest } from '../Game/gameBackendRequests';
import { Story, StoryState } from './types';
import { sleep } from '@/libs/sleep';
import { uniq } from '@/libs/uniq';
import { db } from '../Firebase/firebaseDb';
import { getDoc, setDoc } from 'firebase/firestore';
import { defaultStoryState, numberOfOptionsMap, pointsToWinMap } from './data';
import { getStoryHash } from './getStoryHash';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { clearWordForAudio } from '../Audio/clearWord';
import { getVoiceOverSpeakOptions } from '../Audio/getVoiceOverSpeakOptions';
import { useStories } from './useStories';

interface Sentence {
  sentence: string;
  translate: string;
}

export const StoryModal = ({
  data,

  onClose,
  onNext,
  onPrev,
}: {
  data: Story;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) => {
  const auth = useAuth();
  const settings = useSettings();
  const stories = useStories();

  const targetLanguage = settings.languageCode || 'en';
  const nativeLanguage = settings.userSettings?.nativeLanguageCode || 'en';

  const storyHash = useMemo(
    () => getStoryHash(data, targetLanguage, nativeLanguage),
    [data, targetLanguage, nativeLanguage],
  );

  const docRef = db.documents.storyReadProgress(auth.uid, storyHash);

  const getStoriesProgress = async (): Promise<StoryState | null> => {
    if (typeof window === 'undefined' || !docRef) return null;
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() || null : null;
  };

  const saveStoryProgress = async (state: StoryState) => {
    if (typeof window === 'undefined' || !docRef) return;
    console.log('Save progress');
    await setDoc(docRef, state);
  };

  const onCloseHandler = async () => {
    if (isReady) {
      await saveStoryProgress(internalState);
    }
    onClose();
  };

  const [internalState, setInternalState] = useState<StoryState>(defaultStoryState);

  const [isShowVideo, setIsShowVideo] = useState(true);
  const isVideoAvailable = Boolean(data.videoUrl);
  const showVideo = () => {
    setIsShowVideo(true);
  };

  const isStateInitializing = useRef(false);
  const initState = async () => {
    if (isStateInitializing.current) return;

    isStateInitializing.current = true;
    const savedState = await getStoriesProgress();
    if (savedState) {
      setInternalState(savedState);
    } else {
      setInternalState({ ...defaultStoryState });

      const preparedSentences = await prepareSentences();
      setInternalState((prevState) => ({
        ...prevState,
        sentences: preparedSentences.sentences,
        sentencesTranslates: preparedSentences.sentencesTranslates,
      }));
    }
    isStateInitializing.current = false;
  };

  useEffect(() => {
    initState();
  }, [storyHash]);

  const setState = (data: Partial<StoryState>) => {
    setInternalState((prevState) => {
      const newData = { ...prevState, ...data };
      const isTheSame = JSON.stringify(prevState) === JSON.stringify(newData);
      if (isTheSame) {
        return prevState;
      }

      return newData;
    });
  };

  const state = internalState;

  const { i18n } = useLingui();

  const onComplete = () => {
    setState({ isCompleted: true });
  };

  const audio = useConversationAudio();

  const pointsToWin = pointsToWinMap[state.mode];
  const numberOfOptions = numberOfOptionsMap[state.mode];

  const translator = useTranslate();

  const isTranslateAvailable = translator.isTranslateAvailable;

  const translateSentences = async (sentences: string[]): Promise<string[]> => {
    const isTargetLanguageTheSameAsUserLanguage = targetLanguage === nativeLanguage;
    if (!isTranslateAvailable || isTargetLanguageTheSameAsUserLanguage) {
      const maskedSentences = sentences.map((sentence) => sentence.replace(/\w/g, '*'));
      return maskedSentences;
    }

    const translated = await translator.translateBatchText({
      texts: sentences,
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

  useEffect(() => {
    if (isStateInitializing.current || !isReady) return;

    const timeout = setTimeout(() => {
      saveStoryProgress(internalState);
      console.log('Save story progress');
    }, 4000);

    return () => clearTimeout(timeout);
  }, [internalState, isReady]);

  const imageUrl = data.imageUrl;
  const title = data.title;

  const isNeedToTranslate = targetLanguage !== 'en';

  const prepareSentences = async () => {
    const fullTextEn = data.textEn;

    const fullText = isNeedToTranslate
      ? await translateTextToTargetLanguageFromEng(fullTextEn)
      : fullTextEn;

    const sentences = splitTextIntoSentences(fullText);
    const translatedSentencesToNative = await translateSentences(sentences);

    return {
      sentences,
      sentencesTranslates: translatedSentencesToNative,
    };
  };

  const start = async ({ isStartFromSavedState }: { isStartFromSavedState: boolean }) => {
    audio.initAudio();
    setIsListenMode(false);

    if (state.progress.length > 0 && isStartFromSavedState) {
      setIsReady(true);
    } else {
      setInitializing(true);

      const preparedSentences = state.sentences.length
        ? { sentences: state.sentences, sentencesTranslates: state.sentencesTranslates }
        : await prepareSentences();

      setState({
        progress: '',
        sentences: preparedSentences.sentences,
        sentencesTranslates: preparedSentences.sentencesTranslates,
        isCompleted: false,
        allWords: [],
        badWords: [],
        translationWords: [],
      });
      setIsReady(true);
      setInitializing(false);
    }

    stories.playStoryAudio(data);
  };

  const openInitScreen = () => {
    setIsShowVideo(true);
    setIsListenMode(false);
    audio.music.stop();
  };

  const speakOptionsMain: SpeakOptions = useMemo(
    () => getVoiceOverSpeakOptions(targetLanguage),
    [targetLanguage],
  );

  const cacheAudioWords = async (words: string[]) => {
    console.log('cacheAudioWords', words);

    for (const word of words) {
      const cleanWord = clearWordForAudio(word);
      if (!cleanWord) continue;

      await audio.setTextAsPotentialSpeak2(cleanWord, speakOptionsMain);
      await sleep(200);
      if (auth.isFounder) {
        //showDebugInfoBadgeOnTopWindow('Done with ' + cleanWord);
      }
    }
  };

  const playAudio = async (text: string, alternativeVoice: boolean) => {
    const options = speakOptionsMain;
    const cleanWord = clearWordForAudio(text);
    if (!cleanWord) return;

    if (auth.isFounder) {
      /*
      showDebugInfoBadgeOnTopWindow(
        `Play audio | Text: "${cleanWord}" | Options: ${JSON.stringify(options)} | ${ttsVersion}`,
      );
      */
    }
    //audio.speak(cleanWord, options);
    //await audio.setTextAsPotentialSpeak2(cleanWord, speakOptionsMain);
    await audio.playPotentialSpeakUrl2(cleanWord, speakOptionsMain);
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

  const successRate =
    state.allWords.length > 0
      ? Math.round(((state.allWords.length - state.badWords.length) / state.allWords.length) * 100)
      : 0;

  const onWordSelected = (word: string) => {
    const newWords = uniq([...state.allWords, word]);
    setState({
      allWords: newWords,
    });
  };

  const onBadWord = (word: string) => {
    setState({
      badWords: uniq([...state.badWords, word]),
    });
  };

  const onTranslationWord = (word: string) => {
    setState({
      translationWords: uniq([...state.translationWords, word]),
    });
  };

  const onCorrectWordAvailable = async (word: string) => {
    await sleep(40);
    const cleanWord = clearWordForAudio(word);
    if (!cleanWord) return;

    if (auth.isFounder) {
      // showDebugInfoBadgeOnTopWindow('Correct word is available: ' + cleanWord);
    }

    await audio.setTextAsPotentialSpeak2(cleanWord, speakOptionsMain);
  };

  const attentionWords = uniq([...state.badWords, ...state.translationWords]);

  const isSavedProgress = state.progress.length > 0;

  const [isListenMode, setIsListenMode] = useState(false);

  const [listenState, setListenState] = useState<{
    activeSentence: Sentence;
    activeSentenceIndex: number;
    allSentences: Sentence[];
  } | null>(null);

  const startListenMode = async () => {
    audio.initAudio();
    setIsShowVideo(false);
    setIsReady(false);
    setIsListenMode(true);
    const sourceSentences = await prepareSentences();
    const listeningSentences: Sentence[] = sourceSentences.sentences.map((sentence, index) => ({
      sentence,
      translate: sourceSentences.sentencesTranslates[index],
    }));
    setListenState({
      activeSentence: listeningSentences[0],
      activeSentenceIndex: 0,
      allSentences: listeningSentences,
    });

    audio.speak(listeningSentences[0].sentence, speakOptionsMain);
    audio.setTextAsPotentialSpeak2(listeningSentences[1].sentence, speakOptionsMain);

    stories.playStoryAudio(data);
  };

  const prevListenSentence = () => {
    if (!listenState) return;

    const prevIndex = listenState.activeSentenceIndex - 1;
    if (prevIndex < 0) {
      openInitScreen();
      return;
    }

    const prevSentence = listenState.allSentences[prevIndex];
    setListenState({
      activeSentence: prevSentence,
      activeSentenceIndex: prevIndex,
      allSentences: listenState.allSentences,
    });

    audio.speak(prevSentence.sentence, speakOptionsMain);

    const followingSentence = listenState.allSentences[prevIndex + 1];
    if (followingSentence) {
      audio.setTextAsPotentialSpeak2(followingSentence.sentence, speakOptionsMain);
    }
  };

  const playActiveListenSentence = () => {
    if (!listenState) return;
    audio.speak(listenState.activeSentence.sentence, speakOptionsMain);
  };

  const nextListenSentence = () => {
    if (!listenState) return;

    const nextIndex = listenState.activeSentenceIndex + 1;
    if (nextIndex >= listenState.allSentences.length) {
      openInitScreen();
      return;
    }

    const nextSentence = listenState.allSentences[nextIndex];
    setListenState({
      activeSentence: nextSentence,
      activeSentenceIndex: nextIndex,
      allSentences: listenState.allSentences,
    });

    audio.speak(nextSentence.sentence, speakOptionsMain);

    const followingSentence = listenState.allSentences[nextIndex + 1];
    if (followingSentence) {
      audio.setTextAsPotentialSpeak2(followingSentence.sentence, speakOptionsMain);
    }
  };

  const isShowInitScreen = (!isReady || initializing) && !isListenMode && !isShowVideo;
  const isQuizMode = isReady && !initializing && !isShowVideo;
  const isVideoMode = isVideoAvailable && isShowVideo;

  const isAudioMode = isListenMode && !isShowVideo;

  const backIcon = (
    <Stack
      sx={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 22,
      }}
    >
      <IconButton
        onClick={() => {
          openInitScreen();
        }}
        sx={{
          border: '1px solid rgba(255, 255, 255, 0.4)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          ':hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          },
        }}
        color="default"
      >
        <ArrowLeft size={'20px'} />
      </IconButton>
    </Stack>
  );

  return (
    <CustomModal isOpen={true} onClose={onCloseHandler}>
      {translator.translateModal}
      <StoryContainer story={data}>
        {isVideoMode && (
          <Stack
            sx={{
              position: 'relative',
              height: '100%',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            {data.videoUrl && (
              <StoryVideo
                videoUrl={data.videoUrl}
                bgAudioUrl={data.audioUrl}
                isVideoVolumeEnabled={stories.isVideoVolumeEnabled}
                setIsVideoVolumeEnabled={stories.setIsVideoVolumeEnabled}
                isVideoPaused={stories.isVideoPaused}
                setIsVideoPaused={stories.setIsVideoPaused}
              />
            )}

            <Stack
              sx={{
                gap: '30px',
                position: 'absolute',
                bottom: '160px',
                right: '20px',
                width: 'max-content',
              }}
            >
              <IconButton
                size="large"
                sx={{
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
                onClick={() => onPrev()}
              >
                <ArrowUp size={'34px'} />
              </IconButton>
              <IconButton
                size="large"
                sx={{
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
                onClick={() => onNext()}
              >
                <ArrowDown size={'34px'} />
              </IconButton>
            </Stack>

            <Stack
              sx={{
                position: 'absolute',
                bottom: '10px',
                left: '5px',
                width: '100%',
                padding: '20px',
                gap: '10px',
              }}
            >
              <Stack
                sx={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                <Stack
                  sx={{
                    gap: '10px',
                  }}
                >
                  <Stack
                    sx={{
                      flexDirection: 'row',
                      gap: '10px',
                    }}
                  >
                    <Button
                      endIcon={<Origami size={'20px'} />}
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        setIsShowVideo(false);
                        setIsListenMode(false);
                        start({
                          isStartFromSavedState: isSavedProgress,
                        });
                      }}
                      sx={{
                        padding: '10px 20px',
                      }}
                    >
                      {i18n._('Quiz')}
                    </Button>
                    <Button
                      endIcon={<Play size={'20px'} />}
                      variant="contained"
                      color="info"
                      onClick={() => {
                        startListenMode();
                      }}
                      sx={{
                        padding: '10px 20px',
                      }}
                    >
                      {i18n._('Listen')}
                    </Button>
                  </Stack>

                  <Typography>{data.title}</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        )}

        {isAudioMode && (
          <>
            <Stack
              sx={{
                height: '100%',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '40px',
                padding: '20px',
              }}
            >
              {backIcon}
              <Stack
                sx={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <Stack
                  sx={{
                    minHeight: '240px',
                    gap: '10px',
                  }}
                >
                  <Stack sx={{}}>
                    {listenState?.activeSentence.sentence && (
                      <StoryContent
                        text={listenState?.activeSentence.sentence}
                        size="normal"
                        onPlayAudio={(text) => playAudio(text, false)}
                      />
                    )}
                  </Stack>

                  <Typography variant="body2">
                    {listenState?.activeSentence.translate || '...'}
                  </Typography>
                </Stack>
              </Stack>

              <Stack
                sx={{
                  width: '100%',
                  height: '40%',
                  gap: '30px',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  flexDirection: 'column',
                }}
              >
                <Button
                  onClick={audio.isPlaying ? () => audio.interrupt() : playActiveListenSentence}
                  startIcon={<RefreshCw size={'20px'} />}
                  variant="outlined"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  {i18n._('Replay')}
                </Button>

                <Stack
                  sx={{
                    alignItems: 'flex-start',
                    flexDirection: 'row',
                    gap: '20px',
                    width: '100%',
                  }}
                >
                  <Button
                    color="info"
                    onClick={prevListenSentence}
                    startIcon={<ChevronLeft size={'20px'} />}
                    variant="outlined"
                    fullWidth
                    sx={{
                      padding: '10px 20px',
                    }}
                  >
                    {i18n._('Previous')}
                  </Button>
                  <Button
                    color="info"
                    fullWidth
                    onClick={nextListenSentence}
                    endIcon={<ChevronRight size={'20px'} />}
                    variant="contained"
                    sx={{
                      padding: '10px 20px',
                    }}
                  >
                    {i18n._('Next')}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </>
        )}

        {isShowInitScreen && (
          <Stack
            sx={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <Typography variant="h4" textAlign={'center'}>
              {title}
            </Typography>

            <Typography variant="body2" textAlign={'center'}>
              {data.subtitle || i18n._(`Press the button below to start the adventure!`)}
            </Typography>
            <Stack
              sx={{
                gap: '10px',
                alignItems: 'center',
              }}
            >
              <Button
                disabled={!isVideoAvailable}
                onClick={showVideo}
                endIcon={<Video size={'20px'} />}
                sx={{
                  padding: '10px 30px',
                }}
                variant="contained"
                color="secondary"
              >
                {i18n._('Show video')}
              </Button>

              <Button
                onClick={startListenMode}
                disabled={initializing}
                endIcon={<Music size={'20px'} />}
                sx={{
                  padding: '10px 30px',
                }}
                variant="outlined"
              >
                {i18n._('Listen')}
              </Button>

              <ButtonGroup
                sx={{
                  marginBottom: '0px',
                }}
              >
                <Button
                  size="small"
                  variant={state.mode === 'easy' ? 'contained' : 'outlined'}
                  onClick={() => {
                    setState({ mode: 'easy' });
                  }}
                >
                  {i18n._('Easy')}
                </Button>
                <Button
                  size="small"
                  variant={state.mode === 'medium' ? 'contained' : 'outlined'}
                  onClick={() => setState({ mode: 'medium' })}
                >
                  {i18n._('Medium')}
                </Button>
                <Button
                  size="small"
                  variant={state.mode === 'hard' ? 'contained' : 'outlined'}
                  onClick={() => setState({ mode: 'hard' })}
                >
                  {i18n._('Hard')}
                </Button>
              </ButtonGroup>
              <Stack
                sx={{
                  flexDirection: 'row',
                  gap: '10px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {isSavedProgress && (
                  <Button
                    sx={{
                      padding: '15px 45px',
                      fontSize: '18px',
                    }}
                    variant="contained"
                    color="info"
                    onClick={() => {
                      start({
                        isStartFromSavedState: true,
                      });
                    }}
                    endIcon={<BookmarkIcon />}
                  >
                    {i18n._('Continue')}
                  </Button>
                )}

                <Button
                  sx={{
                    padding: '15px 45px',
                    fontSize: '18px',
                    backgroundColor: isSavedProgress ? 'rgba(0, 0, 0, 0.7)' : undefined,
                  }}
                  variant={isSavedProgress ? 'outlined' : 'contained'}
                  color="info"
                  onClick={() => {
                    if (initializing) return;
                    start({
                      isStartFromSavedState: false,
                    });
                  }}
                  endIcon={initializing ? <Loader size={'20px'} /> : <Origami size={'20px'} />}
                >
                  {initializing
                    ? i18n._('Preparing...')
                    : isSavedProgress
                      ? i18n._('Fresh start')
                      : i18n._('Start Quiz')}
                </Button>
              </Stack>

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
                endIcon={<ChevronRight size={'20px'} />}
              >
                {i18n._('Next story')}
              </Button>
            </Stack>
          </Stack>
        )}

        {isQuizMode && (
          <Stack
            sx={{
              position: 'relative',
              height: '100%',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            {backIcon}
            <Stack
              sx={{
                width: '100%',
                height: '100%',
                padding: '0',
              }}
            >
              {!state.isCompleted && (
                <TextConstructor
                  numberOfOptions={numberOfOptions}
                  sentences={state.sentences}
                  sentencesTranslates={state.sentencesTranslates}
                  progress={state.progress}
                  onContinue={(progress: string) => setState({ progress })}
                  onComplete={onComplete}
                  onSentenceComplete={onSentenceComplete}
                  onPlayAudio={playAudio}
                  onActiveWordsChange={cacheAudioWords}
                  onGoodWord={onWordSelected}
                  onBadWord={onBadWord}
                  onTranslationWord={onTranslationWord}
                  onCorrectWordAvailable={onCorrectWordAvailable}
                />
              )}

              {state.isCompleted && (
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
                      {data.videoUrl && (
                        <Stack
                          sx={{
                            maxWidth: '100%',
                          }}
                        >
                          <Stack
                            component={'video'}
                            src={data.videoUrl}
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
                          text={state.progress}
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
                        onClick={() => openInitScreen()}
                        endIcon={<X size={'20px'} />}
                      >
                        {i18n._('Close')}
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Stack>
        )}
      </StoryContainer>
    </CustomModal>
  );
};

export const StoryContainer = ({
  story,
  children,
}: {
  story: Story;
  children?: React.ReactNode;
}) => {
  const imageUrl = story.imageUrl;

  return (
    <Stack
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack
        sx={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '900px',
          height: '100%',
          position: 'relative',
          borderRadius: '16px',

          overflow: 'hidden',
          '@media (max-width: 650px)': {
            border: 'none',
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: '0px',
          },

          ':after': {
            content: '""',
            position: 'absolute',
            pointerEvents: 'none',
            inset: 0,
            zIndex: 2,
            borderRadius: '16px',
            boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)',
            '@media (max-width: 650px)': {
              boxShadow: 'none',
            },
          },
        }}
      >
        <Stack
          sx={{
            width: '100%',
            height: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {children}
        </Stack>

        <Stack
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            zIndex: 0,
          }}
        >
          <Image
            src={imageUrl}
            alt={`Image for story ${story.title}`}
            fill
            sizes="1000px"
            style={{
              objectFit: 'cover',
            }}
          />
          <Stack
            sx={{
              position: 'absolute',
              inset: 0,

              background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)',
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export const StoryVideo = ({
  videoUrl,
  bgAudioUrl,
  isVideoVolumeEnabled,
  setIsVideoVolumeEnabled,
  isVideoPaused,
  setIsVideoPaused,
}: {
  videoUrl: string;
  bgAudioUrl?: string | null;
  isVideoVolumeEnabled: boolean;
  setIsVideoVolumeEnabled: (enabled: boolean) => void;
  isVideoPaused: boolean;
  setIsVideoPaused: (paused: boolean) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audio = useConversationAudio();

  const toggleVolume = () => {
    audio.initAudio();
    const isNeedToEnable = !isVideoVolumeEnabled;
    setIsVideoVolumeEnabled(isNeedToEnable);
    // remove
    audio.music.setVolume(isNeedToEnable ? 0.1 : 0);
  };

  const togglePause = () => {
    audio.initAudio();
    if (!videoRef.current) return;

    const isNeedToPause = !isVideoPaused;

    if (isNeedToPause) {
      videoRef.current.pause();

      // remove
      audio.music.pause();
    } else {
      videoRef.current.play();
      // remove
      if (bgAudioUrl) {
        audio.music.play(bgAudioUrl);
        audio.music.setVolume(0.1);
      }
    }

    setIsVideoPaused(isNeedToPause);
  };

  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <Stack
        sx={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1,
          flexDirection: 'row',
          gap: '5px',
          alignItems: 'center',
        }}
      >
        <IconButton size="large" onClick={toggleVolume} color="default">
          {isVideoVolumeEnabled ? <Volume2 size={'23px'} /> : <VolumeX size={'23px'} />}
        </IconButton>
        <IconButton size="large" onClick={togglePause} color="default">
          {isVideoPaused ? <Play size={'23px'} /> : <Pause size={'23px'} />}
        </IconButton>
      </Stack>
      <Stack
        component={'video'}
        ref={videoRef}
        src={videoUrl}
        controls={false}
        muted={!isVideoVolumeEnabled}
        onClick={togglePause}
        playsInline
        autoPlay
        onPause={(e) => {
          setIsVideoPaused(true);
          audio.music.pause();
        }}
        onPlay={() => {
          setIsVideoPaused(false);
        }}
        loop
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </Stack>
  );
};
