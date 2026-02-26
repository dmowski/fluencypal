import { useLingui } from '@lingui/react';
import { Button, ButtonGroup, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSettings } from '../Settings/useSettings';
import { useTranslate } from '../Translation/useTranslate';
import { splitTextIntoSentences } from './TextConstructor/splitTextIntoSentences';
import { StoryContent, TextConstructor } from './TextConstructor/TextConstructor';
import { ChevronRight, Loader, Music, Origami, X } from 'lucide-react';
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
import { useAudioCache } from '../Audio/useAudioCache';
import { clearWordForAudio } from '../Audio/clearWord';
import { getVoiceOverSpeakOptions } from '../Audio/getVoiceOverSpeakOptions';

interface Sentence {
  sentence: string;
  translate: string;
}

export const StoryModal = ({
  data,

  onClose,
  onNext,
}: {
  data: Story;
  onClose: () => void;
  onNext: () => void;
}) => {
  const auth = useAuth();
  const settings = useSettings();

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
    await setDoc(docRef, state);
  };

  const onCloseHandler = async () => {
    if (isReady) {
      await saveStoryProgress(internalState);
    }
    onClose();
  };

  const [internalState, setInternalState] = useState<StoryState>(defaultStoryState);

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

  const storyText = data.textEn;
  const wordsCount = storyText.split(' ').length;

  const { i18n } = useLingui();

  const onComplete = () => {
    setState({ isCompleted: true });
  };

  const audio = useConversationAudio();

  const audioCache = useAudioCache();

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

    if (data.audioUrl && !audio.music.isPlaying) {
      const audioUrl = data.audioUrl;
      await sleep(500);
      audio.music.play(audioUrl);
      audio.music.setVolume(0.1);
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
  };

  const nextListenSentence = () => {
    if (!listenState) return;

    const nextIndex = listenState.activeSentenceIndex + 1;
    if (nextIndex >= listenState.allSentences.length) {
      setListenState(null);
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

  return (
    <CustomModal isOpen={true} onClose={onCloseHandler}>
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
          {isListenMode && (
            <>
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
                        width: '100%',
                        maxWidth: '850px',
                        alignItems: 'flex-start',
                        gap: '30px',
                        height: '100%',
                      }}
                    >
                      <Stack
                        sx={{
                          width: '100%',
                          height: '100%',
                          justifyContent: 'flex-end',
                          gap: '10px',
                        }}
                      >
                        <Typography
                          variant="h3"
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
                          {listenState?.activeSentence.sentence || i18n._('Loading...')}
                        </Typography>
                        <Typography>{listenState?.activeSentence.translate || '...'}</Typography>
                      </Stack>

                      <Stack
                        sx={{
                          width: '100%',
                          height: '40dvh',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Button
                          color="info"
                          onClick={nextListenSentence}
                          endIcon={<ChevronRight size={'20px'} />}
                          variant="contained"
                          sx={{
                            padding: '10px 50px',
                          }}
                        >
                          {i18n._('Next')}
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </>
          )}

          {(!isReady || initializing) && !isListenMode && (
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
                      {data.subtitle || i18n._(`Press the button below to start the adventure!`)}
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
                    <Typography
                      className="decor-text"
                      sx={{
                        fontStyle: 'italic',
                      }}
                    >
                      {i18n._('Or quiz it')}
                    </Typography>
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
                        endIcon={
                          initializing ? <Loader size={'20px'} /> : <Origami size={'20px'} />
                        }
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
                          onClick={() => onCloseHandler()}
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
                    opacity: state.isCompleted ? 1 : 1,
                    background:
                      'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)',
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
