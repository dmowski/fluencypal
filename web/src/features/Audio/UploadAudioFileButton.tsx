import { Button, CircularProgress, IconButton } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAuth } from '../Auth/useAuth';
import { sendUploadFileRequest } from '@/app/api/uploadFile/sendUploadFileRequest';
import { useRef, useState } from 'react';
import { Music2 } from 'lucide-react';

interface UploadAudioFileButtonProps {
  onNewUploadUrl: (url: string) => void;
  type?: 'button' | 'icon';
}

export const UploadAudioFileButton = ({
  onNewUploadUrl,
  type = 'button',
}: UploadAudioFileButtonProps) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/ogg',
      'audio/mp4',
    ];

    if (!validTypes.includes(file.type)) {
      alert(i18n._('Please select a valid audio file (MP3, WAV, OGG, or M4A)'));
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(i18n._('File size must be less than 50MB'));
      return;
    }

    try {
      setIsUploading(true);
      const authToken = await auth.getToken();
      const result = await sendUploadFileRequest({ file, type: 'audio' }, authToken);

      if (result.error) {
        alert(i18n._('Failed to upload audio. Please try again.'));
        return;
      }

      onNewUploadUrl(result.uploadUrl);
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert(i18n._('Failed to upload audio. Please try again.') + error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/ogg,audio/mp4"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {type === 'icon' ? (
        <IconButton onClick={handleUploadClick} disabled={isUploading}>
          {isUploading ? (
            <CircularProgress size={'18px'} />
          ) : (
            <Music2 size={'18px'} color="rgba(200, 200, 200, 1)" />
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
              <CircularProgress size={20} sx={{ mr: 1 }} />
              {i18n._('Uploading...')}
            </>
          ) : (
            i18n._('Upload audio')
          )}
        </Button>
      )}
    </>
  );
};
