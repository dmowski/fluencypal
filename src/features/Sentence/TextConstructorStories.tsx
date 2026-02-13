import { useLingui } from '@lingui/react';
import { Button, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Image from 'next/image';
import { ImageDescription, imageDescriptions } from '../Game/ImagesDescriptions';
import { useEffect, useState } from 'react';
import { useTextAi } from '../Ai/useTextAi';
import { useSettings } from '../Settings/useSettings';
import { useTranslate } from '../Translation/useTranslate';
import { splitTextIntoSentences } from './splitTextIntoSentences';
import { TextConstructor } from './TextConstructor';
import { Loader, Origami, RefreshCw, X } from 'lucide-react';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { shuffleArray } from '@/libs/array';
import { sleep } from '@/libs/sleep';

export const TextConstructorStories = () => {
  const { i18n } = useLingui();
  const [selectedImage, setSelectedImage] = useState<ImageDescription | null>(null);

  const [images, setImages] = useState<ImageDescription[]>([]);

  const initImage = () => {
    if (images.length > 0) {
      return;
    }
    const randomImages = shuffleArray(imageDescriptions);
    setImages(randomImages);
  };

  useEffect(() => {
    const isWindow = typeof window !== 'undefined';
    if (!isWindow) return;
    initImage();
  }, []);

  const closeStory = () => {
    setSelectedImage(null);
  };

  const onNext = async () => {
    const currentIndex = images.findIndex((img) => img.url === selectedImage?.url);
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  return (
    <Stack
      sx={{
        alignItems: 'flex-start',
        gap: '10px',
        marginTop: '20px',

        width: '100%',
        position: 'relative',
      }}
    >
      {selectedImage && (
        <StoryModal imageDescription={selectedImage} onClose={closeStory} onNext={onNext} />
      )}
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
          variant="caption"
          sx={{
            opacity: 0.8,
          }}
        >
          {i18n._('Practice crafting sentences')}
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
              padding: '7px 15px 20px 7px',
              width: 'max-content',
            }}
          >
            {images.map((image, index) => {
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
                      boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)',
                    },
                    ':focus': {
                      outline: 'none',
                      boxShadow: '0 0 0 4px #111, 0 0 0 6px #278adc',
                    },
                  }}
                  key={index}
                  component={'button'}
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image.url}
                    alt={image.shortDescription}
                    fill
                    sizes="400px"
                    style={{
                      objectFit: 'cover',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                </Stack>
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
  imageDescription,
  onClose,
  onNext,
}: {
  imageDescription: ImageDescription;
  onClose: () => void;
  onNext: () => void;
}) => {
  const [progress, setProgress] = useState('');
  const ai = useTextAi();
  const settings = useSettings();
  const [sentences, setSentences] = useState<string[]>([]);
  const [sentencesTranslates, setSentencesTranslates] = useState<string[]>([]);

  const userTargetLanguage = settings.fullLanguageName;
  const [isCompleted, setIsCompleted] = useState(false);
  const onComplete = () => {
    setIsCompleted(true);
  };

  useEffect(() => {
    setProgress('');
    setSentences([]);
    setSentencesTranslates([]);
    setIsCompleted(false);
  }, [imageDescription]);

  const translator = useTranslate();
  const { i18n } = useLingui();
  const isTranslateAvailable = translator.isTranslateAvailable;

  const generateTextBasedOnImage = async (image: ImageDescription) => {
    const prompt = `Write a short story in ${userTargetLanguage} based on the following image description: ${image.fullImageDescription}. The story should be around 40 words and suitable for language learners.`;
    const generatedText = await ai.generate({
      userMessage: prompt,
      systemMessage: `You are a helpful assistant for language learners. Generate engaging and simple stories based on image descriptions. The story should be in ${userTargetLanguage} and should be easy to understand for someone learning the language. Avoid complex vocabulary and grammar structures, and focus on creating a clear and enjoyable narrative that helps learners practice their reading skills.`,
      model: 'gpt-4o',
      cache: true,
    });
    return generatedText;
  };

  const translateSentence = async (sentence: string) => {
    if (!isTranslateAvailable) {
      const maskedText = sentence.replace(/\w/g, '*');
      return maskedText;
    }

    const translated = await translator.translateText({
      text: sentence,
    });
    return translated;
  };

  const [initializing, setInitializing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const initialize = async () => {
    if (!imageToday) return;
    setInitializing(true);
    const generatedText = await generateTextBasedOnImage(imageToday);
    console.log('generatedText', generatedText);
    const sentences = splitTextIntoSentences(generatedText);
    console.log('sentences', sentences);
    const translatedSentences = await Promise.all(sentences.map((s) => translateSentence(s)));
    console.log('translatedSentences', translatedSentences);
    setSentences(sentences);
    setSentencesTranslates(translatedSentences);
    setIsReady(true);
    setInitializing(false);
  };
  const imageToday = imageDescription;

  const imageBg = (
    <Image
      src={imageToday.url}
      alt="Today's image"
      fill
      sizes="1200px"
      style={{
        objectFit: 'cover',
        borderRadius: '8px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    />
  );

  return (
    <CustomModal isOpen={true} onClose={onClose}>
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
                    padding: '0px 20px',
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
                        maxWidth: '800px',
                        textWrap: 'balance',
                      }}
                    >
                      {imageDescription.shortDescription}
                    </Typography>
                    <Typography variant="body2" textAlign={'center'}>
                      {i18n._('Press the button below to generate a story based on this image')}
                    </Typography>
                  </Stack>
                  <Stack
                    sx={{
                      gap: '10px',
                    }}
                  >
                    <Button
                      sx={{
                        padding: '10px 30px',
                      }}
                      variant="contained"
                      color="info"
                      onClick={() => {
                        if (initializing) return;
                        initialize();
                      }}
                      endIcon={initializing ? <Loader size={'20px'} /> : <Origami size={'20px'} />}
                    >
                      {initializing ? i18n._('Generating...') : i18n._('Create Story')}
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
                      {i18n._('New Image')}
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
                  maxWidth: '720px',
                  maxHeight: '800px',
                  height: '100%',
                  padding: ' 0 10px 40px 10px',
                }}
              >
                <TextConstructor
                  sentences={sentences}
                  sentencesTranslates={sentencesTranslates}
                  progress={progress}
                  onContinue={setProgress}
                  onComplete={onComplete}
                />
                {isCompleted && (
                  <Stack
                    sx={{
                      width: '100%',
                      alignItems: 'flex-start',
                      gap: '20px',
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        marginTop: '20px',
                      }}
                    >
                      {i18n._('Well done! You completed the story.')}
                    </Typography>
                    <Stack
                      sx={{
                        flexDirection: 'row',
                        gap: '10px',
                        alignItems: 'center',
                        width: '100%',
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
                        {i18n._('Try another image')}
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
                    opacity: isCompleted ? 0.2 : 1,
                    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgb(5, 10, 17) 100%)',
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
