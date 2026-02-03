import { Button, CircularProgress } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useAuth } from '../Auth/useAuth';
import { sendUploadFileRequest } from '@/app/api/uploadFile/sendUploadFileRequest';
import { useRef, useState } from 'react';

interface UploadImageButtonProps {
  onNewUploadUrl: (url: string) => void;
}

export const UploadImageButton = ({ onNewUploadUrl }: UploadImageButtonProps) => {
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

      onNewUploadUrl(result.uploadUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(i18n._('Failed to upload image. Please try again.'));
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
      <Button variant="contained" onClick={handleUploadClick} disabled={isUploading} sx={{ mt: 2 }}>
        {isUploading ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            {i18n._('Uploading...')}
          </>
        ) : (
          i18n._('Upload image')
        )}
      </Button>
    </>
  );
};
