import { Button, CircularProgress, IconButton } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAuth } from '../Auth/useAuth';
import { sendUploadFileRequest } from '@/app/api/uploadFile/sendUploadFileRequest';
import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';

interface UploadImageButtonProps {
  onNewUploadUrl: (url: string) => void;
  type?: 'button' | 'icon';
}

export const UploadImageButton = ({ onNewUploadUrl, type = 'button' }: UploadImageButtonProps) => {
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

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert(i18n._('Please select a valid image file (JPEG, PNG, GIF, or WebP)'));
      return;
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(i18n._('File size must be less than 50MB'));
      return;
    }

    try {
      setIsUploading(true);
      const authToken = await auth.getToken();
      const result = await sendUploadFileRequest({ file, type: 'image' }, authToken);

      if (result.error) {
        alert(i18n._('Failed to upload image. Please try again.'));
        return;
      }
      console.log('result.uploadUrl', result.uploadUrl);
      onNewUploadUrl(result.uploadUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(i18n._('Failed to upload image. Please try again.') + error);
    } finally {
      setIsUploading(false);
      // Reset input value to allow re-uploading the same file
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
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      {type === 'icon' ? (
        <>
          <IconButton onClick={handleUploadClick} disabled={isUploading}>
            {isUploading ? (
              <CircularProgress size={'18px'} />
            ) : (
              <ImagePlus size={'18px'} color="rgba(200, 200, 200, 1)" />
            )}
          </IconButton>
        </>
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
            i18n._('Upload image')
          )}
        </Button>
      )}
    </>
  );
};
