import { useLingui } from '@lingui/react';
import { Button, Stack, Typography } from '@mui/material';
import { StoreCard } from '../uiKit/Card/StoreCard';

import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useGame } from '../Game/useGame';
import { useSettings } from '../Settings/useSettings';
import { useState } from 'react';
import { GameOnboarding } from '../Game/GameOnboarding';
import { exitFullScreen } from '@/libs/fullScreen';
import { GameQuestion } from '../Game/GameQuestion';
import { SectionHeader } from './CartsHeader';
import { PositionChanged } from '../Game/PositionChanged';
import { Loader, Swords } from 'lucide-react';

export const GameDashboardCard = () => {
  const game = useGame();
  const { i18n } = useLingui();
  const settings = useSettings();
  const isGameOnboardingCompleted = settings.userSettings?.isGameOnboardingCompleted;
  const [isShowOnboarding, setIsShowOnboarding] = useState(false);

  const onPlayClick = () => {
    if (!isGameOnboardingCompleted) {
      setIsShowOnboarding(true);
    }
    game.playGame();
  };

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader
        title={i18n._('Game')}
        subTitle={i18n._(
          'Test your knowledge, participate in challenges, and compete with others on the leaderboard.',
        )}
      />

      <Stack
        sx={{
          gap: '10px',
        }}
      >
        {isShowOnboarding && !isGameOnboardingCompleted && (
          <GameOnboarding
            onFinish={() => {
              setIsShowOnboarding(false);
              settings.onDoneGameOnboarding();
            }}
          />
        )}

        {game.activeQuestion && game.isGamePlaying && !isShowOnboarding && (
          <Stack
            sx={{
              gap: '20px',
            }}
          >
            <CustomModal
              isOpen={true}
              onClose={() => {
                game.stopGame();
                exitFullScreen();
              }}
            >
              <Stack
                sx={{
                  padding: '0',
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <GameQuestion />
              </Stack>
            </CustomModal>
          </Stack>
        )}

        <StoreCard
          textColor={'#fff'}
          backgroundColor={'#191919'}
          previewImageUrl={
            'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773967504941-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png'
          }
          subTitle={i18n._('Rank in top 5 on the leaderboard and get the app for free!')}
          title={i18n._('Ready to test your knowledge?')}
          items={[]}
          onClick={onPlayClick}
          itemsBackgroundColor={'rgb(150, 137, 137)'}
          itemsViewMode={'list'}
        >
          <Stack
            sx={{
              padding: '30px 20px 20px 20px',
              gap: '10px',
              alignItems: 'flex-start',
              '@media (max-width: 500px)': {
                padding: '15px',
              },
            }}
          >
            <Button
              variant={'contained'}
              startIcon={game.loadingQuestions ? <Loader /> : <Swords />}
              color="info"
              onClick={onPlayClick}
              disabled={game.loadingQuestions}
              sx={{
                minWidth: '250px',
                padding: '10px 40px',
                '@media (max-width: 500px)': {
                  padding: '10px 20px',
                },
              }}
            >
              {game.loadingQuestions ? i18n._(`Loading...`) : i18n._(`Play`)}
            </Button>

            <Typography
              variant="body2"
              sx={{
                paddingLeft: '5px',
                opacity: 0.7,
              }}
            >
              {i18n._(`Answer questions correctly to climb the leaderboard!`)}
            </Typography>

            <PositionChanged />
          </Stack>
        </StoreCard>
      </Stack>
    </Stack>
  );
};
