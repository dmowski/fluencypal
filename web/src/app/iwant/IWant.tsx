'use client';

import { Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { Image } from '@mui/icons-material';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { Trash, Wand } from 'lucide-react';

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
    '#43aa8b',
    '#f3722c',
    '#79f619',
    '#ff007f',
  ];

  const hash = Array.from(title).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return textColors[hash % textColors.length];
};

export const IWant = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultMarkdown, setResultMarkdown] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      setError('Please choose an image file.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please upload a photo first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResultMarkdown('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/iWant', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as IWantResponse;

      if (!response.ok || !data.resultMarkdown) {
        setError(data.error || 'Failed to analyze image. Please try again.');
        return;
      }

      setResultMarkdown(data.resultMarkdown);
    } catch {
      setError('Request failed. Please try again.');
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

  const image = imagePreview ? (
    <Stack
      component={'img'}
      src={imagePreview}
      alt="Uploaded preview"
      sx={{
        maxWidth: '100%',
        width: '320px',
        height: 'auto',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    />
  ) : null;

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
        <Stack>
          <Typography
            variant="h2"
            component={'h3'}
            sx={{
              fontWeight: 900,
            }}
          >
            I want...
          </Typography>

          <Typography>Upload a photo and AI will tell you what you want.</Typography>
        </Stack>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} hidden />

        {!selectedFile && (
          <Stack>
            <Button
              variant={selectedFile ? 'outlined' : 'contained'}
              color="info"
              startIcon={<Image />}
              onClick={handleChooseFile}
              sx={{
                padding: '10px 20px',
                maxWidth: '300px',
              }}
            >
              Upload a photo
            </Button>

            <Typography
              sx={{
                opacity: 0.75,
                fontSize: '14px',
                paddingTop: '6px',
              }}
            >
              After submitting your photo, it will be processed with AI and removed right after
              processing.
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
            {imagePreview && <ImagePreview src={imagePreview} maxSize={120} />}

            <Stack
              sx={{
                h2: {
                  fontWeight: 800,
                  fontSize: '52px',
                  color: getColorBasedOnTitle(resultMarkdown),
                },
              }}
            >
              <Markdown variant="normal">{resultMarkdown}</Markdown>
            </Stack>
            <Button
              variant="outlined"
              onClick={handleRetry}
              sx={{
                alignSelf: 'flex-start',
              }}
            >
              Try another photo
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
              onClick={handleSubmit}
              disabled={isLoading}
              color="secondary"
              endIcon={<Wand />}
              sx={{
                padding: '10px 20px',
                maxWidth: '300px',
              }}
            >
              {isLoading ? (
                <Stack direction="row" alignItems="center" gap={1}>
                  <CircularProgress size={18} color="inherit" />
                  <span>Thinking...</span>
                </Stack>
              ) : (
                'Tell me what I want'
              )}
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
