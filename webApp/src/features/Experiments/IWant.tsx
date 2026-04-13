'use client';

import { Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { Image } from '@mui/icons-material';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { ChevronRight, Trash, Wand } from 'lucide-react';
import { fullEnglishLanguageName, SupportedLanguage } from '../Lang/lang';
import { useLingui } from '@lingui/react';
import { useConversationAudio } from '../Audio/useConversationAudio';

interface IWantResponse {
  resultMarkdown?: string;
  error?: string;
}

const getColorBasedOnTitle = (title: string) => {
  // colors that looks good on dark background and are different enough from each other
  const textColors: string[] = [
    '#31ffcf',
    '#ff6b6b',
    '#fcb716',
    '#7bfe16',
    '#f94144',
    '#1391ff',
    '#ff61a6',
    '#ff9f1c',
    '#1bffbb',
    '#f3722c',
    '#79f619',
    '#ff007f',
  ];

  const hash = Array.from(title).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return textColors[hash % textColors.length];
};

export const IWantComponent = ({ lang }: { lang: SupportedLanguage }) => {
  const { i18n } = useLingui();

  const fullLanguageName = fullEnglishLanguageName[lang];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultMarkdown, setResultMarkdown] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audio = useConversationAudio();

  const imagePreview = useMemo(() => {
    if (!selectedFile) {
      return '';
    }
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChooseFile = () => {
    audio.initAudio();
    setError('');
    setResultMarkdown('');
    setSelectedFile(null);

    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setError('');
    setResultMarkdown('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError(i18n._('Please choose an image file.'));
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    handleSubmit(file);
  };

  const handleSubmit = async (directFile?: File) => {
    const file = directFile || selectedFile;
    if (!file) {
      setError(i18n._('Please upload a photo first.'));
      return;
    }

    setIsLoading(true);
    setError('');
    setResultMarkdown('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/iWant?fullLanguageName=${fullLanguageName}`, {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as IWantResponse;

      if (!response.ok || !data.resultMarkdown) {
        setError(data.error || i18n._('Failed to analyze image. Please try again.'));
        return;
      }

      setResultMarkdown(data.resultMarkdown);

      const firstLine = data.resultMarkdown
        .split('\n')[0]
        .replace(/#/g, '')
        .trim()
        .replaceAll('*', '')
        .trim();

      const textToVoice = firstLine;

      audio.speak(textToVoice, {
        instructions: '',
        voice: 'marin',
      });
    } catch {
      setError(i18n._('Request failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setSelectedFile(null);
    setResultMarkdown('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Stack
      sx={{
        alignItems: 'center',
      }}
    >
      <Stack
        sx={{
          maxWidth: '560px',
          width: '100%',
          padding: '5px',
          borderRadius: '8px',
          gap: '35px',
          paddingTop: '90px',
          paddingBottom: '90px',
          '@media (max-width: 600px)': {
            paddingTop: '30px',
          },
        }}
      >
        {!selectedFile && (
          <Stack>
            <Typography
              variant="h2"
              component={'h3'}
              sx={{
                fontWeight: 900,
              }}
            >
              {i18n._('I want...')}
            </Typography>

            <Typography>{i18n._('Upload a photo and AI will tell you what you want.')}</Typography>
          </Stack>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} hidden />

        {!selectedFile && (
          <Stack>
            <Button
              variant={'contained'}
              color="info"
              startIcon={<Image />}
              onClick={handleChooseFile}
              sx={{
                padding: '10px 20px',
                maxWidth: '300px',
              }}
            >
              {i18n._('Upload a photo')}
            </Button>

            <Typography
              sx={{
                opacity: 0.75,
                fontSize: '14px',
                paddingTop: '6px',
              }}
            >
              {i18n._(
                'After submitting your photo, it will be processed with AI and removed right after processing.',
              )}
            </Typography>
          </Stack>
        )}

        {resultMarkdown && (
          <Stack
            sx={{
              width: '100%',
              borderRadius: '8px',
              gap: '12px',
            }}
          >
            <Stack
              sx={{
                position: 'relative',
                minHeight: '330px',
              }}
            >
              <Stack
                component={'img'}
                src={imagePreview}
                alt="Uploaded preview"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              />
              <Stack
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(180deg, rgba(0,0,0, 0.5) 0%, rgba(0,0,0,0) 100%)',
                  borderRadius: '8px',
                }}
              ></Stack>

              <Stack
                sx={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  padding: '10px 20px',
                  h2: {
                    fontWeight: 800,
                    fontSize: '42px',
                    color: getColorBasedOnTitle(resultMarkdown),
                    paddingBottom: '10px',
                    paddingTop: '0',
                  },
                }}
              >
                <Markdown variant="normal">{resultMarkdown}</Markdown>
              </Stack>
            </Stack>

            <Button
              variant={'contained'}
              color="info"
              startIcon={<Image />}
              onClick={handleChooseFile}
              sx={{
                padding: '10px 20px',
                maxWidth: '300px',
              }}
            >
              {i18n._('Upload a photo')}
            </Button>
          </Stack>
        )}

        {selectedFile && !resultMarkdown && (
          <Stack
            sx={{
              gap: '12px',
              width: '100%',
            }}
          >
            <Stack
              sx={{
                alignItems: 'flex-start',
                position: 'relative',
              }}
            >
              {imagePreview && <ImagePreview src={imagePreview} maxSize={320} />}

              <IconButton
                onClick={handleRetry}
                sx={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                }}
              >
                <Trash />
              </IconButton>
            </Stack>

            <Button
              variant="contained"
              onClick={() => handleSubmit()}
              disabled={isLoading}
              color="info"
              startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <Wand />}
              endIcon={<ChevronRight />}
              sx={{
                padding: '10px 20px',
                maxWidth: '300px',
              }}
            >
              {isLoading ? i18n._('Thinking...') : i18n._('Tell me what I want')}
            </Button>
          </Stack>
        )}

        {error ? (
          <Typography
            sx={{
              color: '#ff8d8d',
              textAlign: 'center',
            }}
          >
            {error}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );
};

const ImagePreview = ({ src, maxSize }: { src: string; maxSize: number }) => {
  return (
    <Stack
      component={'img'}
      src={src}
      alt="Uploaded preview"
      sx={{
        width: maxSize,
        height: maxSize,
        objectFit: 'cover',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    />
  );
};
