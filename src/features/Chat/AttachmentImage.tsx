import { IconButton, Modal, Stack } from '@mui/material';
import { Trash, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { CustomModal } from '../uiKit/Modal/CustomModal';

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
          }}
          onClick={() => setIsModalOpen(true)}
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
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <Stack
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              <Image
                src={url}
                alt="Full size image"
                fill
                sizes="1100px"
                style={{
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
