import { Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAuth } from '../Auth/useAuth';
import { sendUploadFileRequest } from '@/app/api/uploadFile/sendUploadFileRequest';
import { useEffect, useRef, useState } from 'react';
import { Video } from 'lucide-react';
import { VideoConverter } from './videoConverter';

interface UploadVideoButtonProps {
  onNewUploadUrl: (url: string) => void;
  type?: 'button' | 'icon';
  uploadMode?: 'server' | 'mock';
}

export const UploadVideoButton = ({
  onNewUploadUrl,
  type = 'button',
  uploadMode = 'server',
}: UploadVideoButtonProps) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const converterRef = useRef<VideoConverter | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      converterRef.current?.destroy();
      converterRef.current = null;
    };
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      alert(i18n._('Please select a valid video file (MP4, WebM, or MOV)'));
      return;
    }

    const maxSize = 250 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(i18n._('File size must be less than 250MB'));
      return;
    }

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

    try {
      setIsUploading(true);
      setProgress(0);

      if (!converterRef.current) {
        converterRef.current = new VideoConverter();
      }

      const result = await converterRef.current.convert(file, (progressData) => {
        setProgress(progressData.progress);
      });
      setProgress(100);
      const convertedBlob = new Blob([result.videoData.slice()], { type: 'video/mp4' });
      const convertedFile = new File([convertedBlob], result.videoName, { type: 'video/mp4' });

      if (convertedFile.size > maxSize) {
        alert(i18n._('Converted file size must be less than 250MB'));
        return;
      }

      if (uploadMode === 'mock') {
        const dataUrl = await blobToDataUrl(convertedBlob);
        onNewUploadUrl(dataUrl);
        return;
      }

      const authToken = await auth.getToken();
      const uploadResult = await sendUploadFileRequest(
        { file: convertedFile, type: 'video' },
        authToken,
      );

      if (uploadResult.error) {
        alert(i18n._('Failed to upload video. Please try again.'));
        return;
      }

      onNewUploadUrl(uploadResult.uploadUrl);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert(i18n._('Failed to upload video. Please try again.') + error);
    } finally {
      setIsUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const progressText = (
    <Typography
      style={{
        position: 'absolute',
        fontSize: '8px',
        fontWeight: 500,
        color: 'rgba(200, 200, 200, 1)',
      }}
    >
      {Math.round(progress)}%
    </Typography>
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      {type === 'icon' ? (
        <IconButton onClick={handleUploadClick} disabled={isUploading}>
          {isUploading ? (
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
              }}
            >
              <Stack
                sx={{
                  transform: 'scale(1.6)',
                }}
              >
                <CircularProgress size={18} variant="determinate" value={Math.max(4, progress)} />
              </Stack>
              {progressText}
            </div>
          ) : (
            <Video size={'18px'} color="rgba(200, 200, 200, 1)" />
          )}
        </IconButton>
      ) : (
        <Button
          variant="contained"
          onClick={handleUploadClick}
          disabled={isUploading}
          sx={{ mt: 2 }}
        >
          {isUploading ? (
            <>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '8px',
                }}
              >
                <CircularProgress size={20} variant="determinate" value={progress} />
                {progressText}
              </div>
              {i18n._('Uploading...')}
            </>
          ) : (
            i18n._('Upload video')
          )}
        </Button>
      )}
    </>
  );
};
