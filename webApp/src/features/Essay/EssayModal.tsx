import { Stack } from '@mui/material';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { Essay } from './Essay';

export const EssayModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <CustomModal onClose={onClose} isOpen={true}>
      <Stack
        sx={{
          padding: '20px 0px',
        }}
      >
        <Essay />
      </Stack>
    </CustomModal>
  );
};
