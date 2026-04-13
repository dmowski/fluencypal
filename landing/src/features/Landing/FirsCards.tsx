import { Stack, Typography } from '@mui/material';
import { GradientCard } from '../uiKit/Card/GradientCard';

interface ShortCard {
  title: string;
  description: string;
}

const ShortCard: React.FC<ShortCard> = ({ title, description }) => {
  const startColor = 'rgba(5, 172, 255, 1)';
  const endColor = 'rgba(5, 172, 255, 0.9)';
  return (
    <GradientCard startColor={startColor} endColor={endColor} strokeWidth="1px">
      <Typography
        variant="h5"
        component={'h2'}
        sx={{
          fontWeight: '400',
          width: '100%',
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          opacity: 0.7,
        }}
      >
        {description}
      </Typography>
    </GradientCard>
  );
};

export const FirsCards = () => {
  return (
    <Stack
      sx={{
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          padding: '0 30px',
          boxSizing: 'border-box',
          gap: '25px',
          width: '100%',
          justifyContent: 'space-between',
          maxWidth: '1400px',
          position: 'relative',
          zIndex: 1,
          '@media (max-width: 800px)': {
            gridTemplateColumns: '1fr',
          },
        }}
      >
        <ShortCard
          title="Real-Time Voice Chats"
          description="Speak with our AI tutor for instant feedback. Build confidence through quick, natural dialogues."
        />
        <ShortCard
          title="Daily Tasks"
          description="Practice a short grammar rule, take a quick quiz, and learn a new word. Each task adapts to your level for steady progress."
        />
        <ShortCard
          title="Personalized Homework"
          description="Reinforce new skills with targeted assignments after each session. Practice grammar, vocabulary, and conversation at your pace."
        />
      </Stack>
    </Stack>
  );
};
