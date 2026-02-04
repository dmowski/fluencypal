import { IconButton, Stack } from '@mui/material';
import { Trash } from 'lucide-react';
import Image from 'next/image';

export const AttachmentImage = ({
  url,
  onDelete,
  canDelete,
  size = '80px',
}: {
  url: string;
  onDelete: () => void;
  canDelete: boolean;
  size?: string;
}) => {
  return (
    <Stack
      sx={{
        position: 'relative',
      }}
    >
      <Stack
        sx={{
          width: size,
          height: size,
        }}
      >
        <Image
          src={url}
          alt="Avatar"
          fill
          sizes={size}
          style={{
            objectFit: 'cover',
            zIndex: 1,
            borderRadius: '8px',
          }}
        />
      </Stack>

      {canDelete && (
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            top: '-10px',
            zIndex: 2,

            right: '-10px',
            backgroundColor: 'rgba(0,0,0,1)',
            boxShadow: '0px 0px 0px 1px rgba(255, 255, 255, 0.1)',
          }}
          onClick={() => {
            onDelete();
          }}
        >
          <Trash size={'14px'} color="rgba(222, 222, 222, 1)" />
        </IconButton>
      )}
    </Stack>
  );
};
