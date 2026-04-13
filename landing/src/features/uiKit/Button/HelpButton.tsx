import { Stack, Tooltip } from '@mui/material';
import { Wand } from 'lucide-react';

interface KeyboardButtonProps {
  isEnabled: boolean;
  onClick: () => void;
  isLoading?: boolean;
}

export const HelpButton: React.FC<KeyboardButtonProps> = ({ isEnabled, isLoading, onClick }) => {
  return (
    <Tooltip title={isEnabled ? 'Help me with answer' : 'Answer is loading...'} arrow>
      <Stack>
        <button
          style={{
            backgroundColor: isEnabled ? '#0f4564' : 'rgba(255, 255, 255, 0.3)',
            width: '47px',
            height: '47px',
            position: 'relative',
            cursor: 'pointer',
            border: 'none',
            outline: 'none',
            borderRadius: '50%',
            padding: '0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: isEnabled ? 1 : 0.4,
            boxShadow: isEnabled
              ? '0 0 0 4px rgba(18, 112, 166, 0.1)'
              : '0 0 0 4px rgba(255, 255, 255, 0.2)',
          }}
          disabled={isLoading}
          onClick={() => onClick()}
        >
          <Wand color="#fff" />
        </button>
      </Stack>
    </Tooltip>
  );
};
