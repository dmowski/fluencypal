import { i18n } from '@lingui/core';
import { Stack, Typography, Button } from '@mui/material';
import { Loader, Swords } from 'lucide-react';
import { PositionChanged } from '../Game/PositionChanged';
import { exitFullScreen } from '@/libs/fullScreen';
import { GameOnboarding } from '../Game/GameOnboarding';
import { GameQuestion } from '../Game/GameQuestion';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { useGame } from '../Game/useGame';
import { useSettings } from '../Settings/useSettings';

export const GamePage = () => {
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
    <>
      <Stack
        sx={{
          width: '100%',
          gap: '5px',
        }}
      >
        <Stack
          sx={{
            width: '100%',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',

            padding: '15px 20px',
            boxSizing: 'border-box',

            '@media (max-width: 600px)': {
              padding: '15px',
              border: 'none',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 0,
            },
          }}
        >
          <Stack
            sx={{
              width: '100%',
              //alignItems: "center",
              gap: '10px',
            }}
          >
            <Stack
              sx={{
                gap: '10px',
                alignItems: 'flex-start',
                width: '100%',
                maxWidth: '500px',
              }}
            >
              <Typography variant="h5">{i18n._(`Game`)}</Typography>
              <Typography variant="body2">
                {i18n._(`Ready to test your knowledge and climb the leaderboard?`)}
              </Typography>
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
            </Stack>

            <Stack
              sx={{
                width: '100%',
                paddingTop: '20px',
              }}
            >
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
          </Stack>
        </Stack>
      </Stack>

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
    </>
  );
};
