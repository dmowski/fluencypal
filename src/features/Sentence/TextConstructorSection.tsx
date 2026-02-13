'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { TextConstructor } from './TextConstructor';
import { useTextAi } from '../Ai/useTextAi';
import { useTranslate } from '../Translation/useTranslate';
import { ImageDescription, imageDescriptions } from '@/features/Game/ImagesDescriptions';
import { shuffleArray } from '@/libs/array';
import { useSettings } from '../Settings/useSettings';
import Image from 'next/image';
import { useLingui } from '@lingui/react';
import { Loader, Origami, RefreshCw } from 'lucide-react';
import { splitTextIntoSentences } from './splitTextIntoSentences';

export function TextConstructorSection() {
  const [progress, setProgress] = useState('');
  const { i18n } = useLingui();
  const ai = useTextAi();
  const settings = useSettings();
  const [sentences, setSentences] = useState<string[]>([]);

  const pickRandomImage = (): ImageDescription => {
    const shuffledImages = shuffleArray(imageDescriptions);
    return shuffledImages[0];
  };

  const [imageToday, setImageToday] = useState<ImageDescription>(pickRandomImage());

  const generateNewImage = () => {
    const newImage = pickRandomImage();
    setImageToday(newImage);
  };

  const [sentencesTranslates, setSentencesTranslates] = useState<string[]>([]);

  const userTargetLanguage = settings.fullLanguageName;

  const translator = useTranslate();
  const isTranslateAvailable = translator.isTranslateAvailable;

  const generateTextBasedOnImage = async (image: ImageDescription) => {
    const prompt = `Write a short story in ${userTargetLanguage} based on the following image description: ${image.fullImageDescription}. The story should be around 200 words and suitable for language learners.`;
    const generatedText = await ai.generate({
      userMessage: prompt,
      systemMessage: `You are a helpful assistant for language learners. Generate engaging and simple stories based on image descriptions. The story should be in ${userTargetLanguage} and should be easy to understand for someone learning the language. Avoid complex vocabulary and grammar structures, and focus on creating a clear and enjoyable narrative that helps learners practice their reading skills.`,
      model: 'gpt-4o',
    });
    return generatedText;
  };

  const translateSentence = async (sentence: string) => {
    if (!isTranslateAvailable) {
      // Return original masked text if translation is not available
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

  const imageBg = (
    <Image
      src={imageToday.url}
      alt="Today's image"
      fill
      sizes="700px"
      style={{
        objectFit: 'cover',
        borderRadius: '8px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    />
  );

  return (
    <Stack
      sx={{
        width: '100%',
        padding: '0',
        height: '700px',
        position: 'relative',
      }}
    >
      {(!isReady || initializing) && (
        <Stack>
          <Stack
            sx={{
              width: '100%',
              position: 'relative',
              height: '700px',
              ':after': {
                content: '""',
                position: 'absolute',
                pointerEvents: 'none',
                inset: 0,
                zIndex: 2,
                borderRadius: '8px',
                boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)',
              },
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
                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)',
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
                  }}
                >
                  {i18n._('Ready for a new story?')}
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
                    generateNewImage();
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
          }}
        >
          <TextConstructor
            sentences={sentences}
            sentencesTranslates={sentencesTranslates}
            progress={progress}
            onContinue={setProgress}
          />
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
              ':after': {
                content: '""',
                position: 'absolute',
                pointerEvents: 'none',
                inset: 0,
                zIndex: 2,
                borderRadius: '8px',
                boxShadow: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)',
              },
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
                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgb(5, 10, 17) 100%)',
              }}
            />
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
