'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { UploadImageButton } from '@/features/Game/UploadImageButton';
import { UploadVideoButton } from '@/features/Video/UploadVideoButton';
import { useAuth } from '@/features/Auth/useAuth';
import { sendUploadFileRequest } from '@/app/api/uploadFile/sendUploadFileRequest';
import { VideoConverter } from '@/features/Video/videoConverter';
import { PracticeProvider } from '../practiceProvider';
import { AuthWall } from '@/features/Auth/AuthWall';

function UploadTest() {
  const auth = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isUploadingFromDropOrPaste, setIsUploadingFromDropOrPaste] = useState(false);
  const [isDropOverlayVisible, setIsDropOverlayVisible] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState<'image' | 'video' | null>(null);
  const dragCounterRef = useRef(0);
  const converterRef = useRef<VideoConverter | null>(null);

  useEffect(() => {
    return () => {
      converterRef.current?.destroy();
      converterRef.current = null;
    };
  }, []);

  const uploadImageFile = useCallback(
    async (file: File) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File size must be less than 50MB');
        return;
      }

      const authToken = await auth.getToken();
      const result = await sendUploadFileRequest({ file, type: 'image' }, authToken);

      if (result.error) {
        alert('Failed to upload image. Please try again.');
        return;
      }

      setImageUrl(result.uploadUrl);
      setCopiedTarget(null);
    },
    [auth],
  );

  const uploadVideoFile = useCallback(async (file: File) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid video file (MP4, WebM, or MOV)');
      return;
    }

    const maxSize = 250 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 250MB');
      return;
    }

    if (!converterRef.current) {
      converterRef.current = new VideoConverter();
    }

    const conversionResult = await converterRef.current.convert(file);
    const convertedBlob = new Blob([conversionResult.videoData.slice()], { type: 'video/mp4' });

    const blobToDataUrl = (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
            return;
          }
          reject(new Error('Failed to convert blob to data URL'));
        };
        reader.onerror = () => reject(new Error('Failed to read blob'));
        reader.readAsDataURL(blob);
      });

    const dataUrl = await blobToDataUrl(convertedBlob);
    setVideoUrl(dataUrl);
    setCopiedTarget(null);
  }, []);

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploadingFromDropOrPaste(true);

        if (file.type.startsWith('image/')) {
          await uploadImageFile(file);
          return;
        }

        if (file.type.startsWith('video/')) {
          await uploadVideoFile(file);
          return;
        }

        alert('Only image and video files are supported.');
      } catch (error) {
        console.error('Failed to upload file from drag/paste:', error);
        alert('Failed to upload file. Please try again.');
      } finally {
        setIsUploadingFromDropOrPaste(false);
      }
    },
    [uploadImageFile, uploadVideoFile],
  );

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) {
        return;
      }

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            event.preventDefault();
            void handleFileUpload(file);
          }
          return;
        }
      }
    };

    const handleDragEnter = (event: DragEvent) => {
      event.preventDefault();
      dragCounterRef.current += 1;
      if (event.dataTransfer?.types?.includes('Files')) {
        setIsDropOverlayVisible(true);
      }
    };

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDragLeave = (event: DragEvent) => {
      event.preventDefault();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setIsDropOverlayVisible(false);
      }
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      dragCounterRef.current = 0;
      setIsDropOverlayVisible(false);

      const file = event.dataTransfer?.files?.[0];
      if (file) {
        void handleFileUpload(file);
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleFileUpload]);

  const handleCopyUrl = useCallback(
    async (type: 'image' | 'video') => {
      const url = type === 'image' ? imageUrl : videoUrl;
      if (!url) {
        return;
      }

      try {
        await navigator.clipboard.writeText(url);
        setCopiedTarget(type);
      } catch (error) {
        console.error('Failed to copy URL:', error);
        alert('Failed to copy URL');
      }
    },
    [imageUrl, videoUrl],
  );

  return (
    <>
      <Stack
        sx={{
          padding: '24px',
          gap: '16px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <Typography variant="h4">Upload Test</Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Use these buttons to test image and video upload + conversion.
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          You can also drag & drop files anywhere on screen or paste an image from clipboard.
        </Typography>

        {isUploadingFromDropOrPaste && (
          <Typography variant="body2">Uploading dropped/pasted file...</Typography>
        )}

        <Stack sx={{ gap: '12px' }}>
          <Typography variant="h6">Image</Typography>
          <UploadImageButton onNewUploadUrl={(url) => setImageUrl(url)} />
          {imageUrl && (
            <Stack sx={{ gap: '8px' }}>
              <Typography variant="caption">Image URL</Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {imageUrl}
              </Typography>
              <Button
                variant="contained"
                size="large"
                color="info"
                sx={{ width: '100%', minHeight: '86px', fontSize: '38px' }}
                onClick={() => void handleCopyUrl('image')}
              >
                {copiedTarget === 'image' ? 'Copied!' : 'Copy URL'}
              </Button>
              <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', borderRadius: 8 }} />
            </Stack>
          )}
        </Stack>

        <Stack sx={{ gap: '12px' }}>
          <Typography variant="h6">Video</Typography>
          <UploadVideoButton onNewUploadUrl={(url) => setVideoUrl(url)} uploadMode="mock" />
          {videoUrl && (
            <Stack sx={{ gap: '8px' }}>
              <Typography variant="caption">Video URL</Typography>
              <Typography
                variant="body2"
                sx={{ wordBreak: 'break-all', maxHeight: '100px', overflow: 'auto' }}
              >
                {videoUrl}
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{ width: '100%', minHeight: '56px' }}
                onClick={() => void handleCopyUrl('video')}
              >
                {copiedTarget === 'video' ? 'Copied!' : 'Copy URL'}
              </Button>
              <video src={videoUrl} controls style={{ width: '100%', borderRadius: 8 }} />
            </Stack>
          )}
        </Stack>
      </Stack>
      {isDropOverlayVisible && (
        <Stack
          sx={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            bgcolor: 'background.default',
            opacity: 0.92,
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Stack
            sx={{
              width: '100%',
              height: '100%',
              border: '3px dashed',
              borderColor: 'primary.main',
              borderRadius: '16px',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 2,
            }}
          >
            <Typography variant="h4">Drop file to upload</Typography>
            <Typography variant="body1">Supports image and video files</Typography>
          </Stack>
        </Stack>
      )}
    </>
  );
}

export default function UploadTestPage() {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <PracticeProvider>
          <AuthWall>
            <UploadTest />
          </AuthWall>
        </PracticeProvider>
      </body>
    </html>
  );
}
