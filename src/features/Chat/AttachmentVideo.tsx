import { IconButton, Stack } from '@mui/material';
import { Trash } from 'lucide-react';
import { useState } from 'react';
import { CustomModal } from '../uiKit/Modal/CustomModal';

export const AttachmentVideo = ({
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Stack
        sx={{
          position: 'relative',
        }}
      >
        <Stack
          sx={{
            width: size,
            height: size,
            cursor: 'pointer',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <video
            src={url}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
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
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash size={'14px'} color="rgba(222, 222, 222, 1)" />
          </IconButton>
        )}
      </Stack>

      {isModalOpen && (
        <CustomModal onClose={() => setIsModalOpen(false)} isOpen={true}>
          <Stack
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              height: '90vh',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <Stack
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                src={url}
                controls
                autoPlay
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </Stack>
          </Stack>
        </CustomModal>
      )}
    </>
  );
};
