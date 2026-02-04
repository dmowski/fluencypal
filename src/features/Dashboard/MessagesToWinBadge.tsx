import { Button, Stack, Typography } from '@mui/material';
import { Bird, ChevronDown, ChevronUp } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { ColorIconTextList } from '../Survey/ColorIconTextList';
import { useGame } from '../Game/useGame';
import { useAccess } from '../Usage/useAccess';

export const MessagesToWinBadge = () => {
  const { i18n } = useLingui();
  const [isShowHint, setIsShowHint] = useState(false);

  const game = useGame();
  const access = useAccess();
  const pointsToMessage = 12;
  const myCurrentPoints = game.myPoints || 0;
  const top5PlayersPoints = game.stats.find((stat, index) => index === 5)?.points || 0;
  const diff = top5PlayersPoints - myCurrentPoints;
  const messagesNeeded = Math.ceil(diff / pointsToMessage);

  if (messagesNeeded <= 0 || access.isFullAppAccess) {
    return null;
  }

  return (
    <Stack
      sx={{
        marginBottom: '20px',
        alignItems: 'center',
        gap: '10px',
        flexDirection: 'row',
        justifyContent: 'space-between',

        width: '100%',
        borderRadius: '16px',
        padding: '20px',
        backgroundColor: 'rgba(138, 25, 138, 0.099)',
        border: '1px solid rgba(138, 25, 138, 0.2)',
        flexWrap: 'wrap',
        '@media (max-width:600px)': {
          borderRadius: '0px',
          padding: '20px 10px',
          border: 'none',
        },
      }}
    >
      <Stack>
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            //justifyContent: "center",
            gap: '15px',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
            }}
          >
            {i18n._(`Send {messagesNeeded} messages to unlock full access`, {
              messagesNeeded,
            })}
          </Typography>
        </Stack>
        <Typography
          sx={{
            opacity: 0.7,
          }}
          variant="caption"
        >
          {i18n._(
            'Posting helps you grow in the FluencyPal leaderboard — and helps others learn too.',
          )}
        </Typography>
      </Stack>
      <Button
        onClick={() => setIsShowHint(!isShowHint)}
        variant="outlined"
        startIcon={<Bird />}
        endIcon={isShowHint ? <ChevronUp /> : <ChevronDown />}
        sx={{
          color: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.6)',
        }}
      >
        {i18n._('What can I post?')}
      </Button>

      {isShowHint && (
        <Stack
          sx={{
            gap: '10px',
            marginTop: '20px',
          }}
        >
          <Typography
            sx={{
              opacity: 0.9,
            }}
            variant="body1"
          >
            {i18n._('Not sure what to write? Try one of these:')}
          </Typography>

          <ColorIconTextList
            gap="10px"
            iconSize="16px"
            listItems={[
              {
                title: i18n._('Ask a question you’d normally ask in real life'),
                iconName: 'badge-question-mark',
              },
              {
                title: i18n._('Share a phrase you learned today (or one that confused you)'),
                iconName: 'bug',
              },
              {
                title: i18n._('Recommend a podcast, song, or video in your target language'),
                iconName: 'mic',
              },
              {
                title: i18n._('Ask how others practice speaking or pronunciation'),
                iconName: 'speech',
              },
              {
                title: i18n._('Post a short thought and ask: “Does this sound natural?”'),
                iconName: 'router',
              },
            ]}
          />
          <Typography
            variant="caption"
            sx={{
              paddingTop: '10px',
            }}
          >
            {i18n._('The key: small posts are valid. One sentence is enough.')}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};
