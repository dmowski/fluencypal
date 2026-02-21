import { getI18nInstance } from '@/appRouterI18n';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { SupportedLanguage } from '@/features/Lang/lang';
import { Button, ButtonGroup, Stack, Typography } from '@mui/material';
import { AudioLines, ChevronRight, Heart, Speech, User, Users, Zap } from 'lucide-react';
import { JSX } from 'react';

export const AliasRolePlay = ({ lang }: { lang: SupportedLanguage }): JSX.Element => {
  const i18n = getI18nInstance(lang);
  return (
    <Stack>
      <Stack
        sx={{
          gap: '10px',
          padding: '15px 0 60px 0',
          '@media (max-width: 600px)': {
            gap: '20px',
          },
        }}
      >
        <Stack
          sx={{
            flexDirection: 'row',
            gap: '0 10px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            href={getUrlStart(lang) + 'alias'}
            startIcon={<Users size={'22px'} />}
            endIcon={<ChevronRight size={'22px'} />}
            variant="outlined"
            sx={{
              padding: '10px 25px',
              color: 'white',
              backgroundColor: '#d21963',
            }}
          >
            {i18n._(`Play With Friends`)}
          </Button>
          <Typography
            sx={{
              paddingLeft: '5px',
            }}
          >
            {i18n._(`Play Alias offline with friends in person`)}
          </Typography>
        </Stack>

        <Stack
          sx={{
            flexDirection: 'row',

            gap: '0 10px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            href={getUrlStart(lang) + 'practice?rolePlayId=alias-game'}
            startIcon={<User size={'22px'} />}
            endIcon={<ChevronRight size={'22px'} />}
            variant="outlined"
            sx={{
              padding: '10px 25px',

              color: 'white',
              backgroundColor: '#1976d2',
            }}
          >
            {i18n._(`Play With AI`)}
          </Button>
          <Typography
            sx={{
              paddingLeft: '5px',
            }}
          >
            {i18n._(`Single player mode with AI`)}
          </Typography>
        </Stack>
      </Stack>

      <Typography>
        {i18n._(`Boost your English vocabulary and fluency by creatively describing and guessing words in
        this interactive AI-powered Alias game.`)}
      </Typography>

      <Typography
        variant="h2"
        style={{
          fontWeight: 600,
          paddingTop: '40px',
        }}
      >
        {i18n._(`Benefits of Playing Alias Game`)}
      </Typography>
      <Stack style={{ gap: '10px', padding: '20px 3px' }}>
        <Stack
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '15px',
          }}
        >
          <Speech size={'18px'} />
          <Typography>
            {i18n._(`Enhance your vocabulary by describing words in unique ways.`)}
          </Typography>
        </Stack>

        <Stack
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '15px',
          }}
        >
          <AudioLines size={'18px'} />
          <Typography>
            {i18n._(`Improve listening skills as you interpret descriptions.`)}
          </Typography>
        </Stack>

        <Stack
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '15px',
          }}
        >
          <Zap size={'18px'} />
          <Typography>
            {i18n._(`Practice rapid thinking and fluent speaking under playful pressure.`)}
          </Typography>
        </Stack>

        <Stack
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '15px',
          }}
        >
          <Heart size={'18px'} />
          <Typography>
            {i18n._(`Receive instant, tailored feedback from your AI partner.`)}
          </Typography>
        </Stack>
      </Stack>

      <Typography
        variant="h2"
        style={{
          fontWeight: 600,
          paddingTop: '40px',
        }}
      >
        {i18n._(`How to Play`)}
      </Typography>
      <Typography>
        {i18n._(`You and your AI partner alternate turns describing and guessing words without directly
          naming them. This encourages creative thinking and fluent expression, adapting to your
          language proficiency.`)}
      </Typography>

      <Typography
        variant="h3"
        style={{
          fontWeight: 500,
          padding: '40px 0px 0 0',
          fontSize: '1rem',
        }}
      >
        {i18n._(`Choose Your Language Level`)}
      </Typography>
      <Typography variant="caption" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
        {i18n._(`Pick a level to start playing!`)}
      </Typography>
      <img
        src="/rolePlaysPublic/alias/level.webp"
        style={{
          width: '460px',
          maxWidth: 'calc(100dvw - 32px)',
          borderRadius: '10px',
          height: 'auto',
        }}
        alt={i18n._(`Alias Game Levels`)}
      />

      <Typography
        variant="h3"
        style={{
          fontWeight: 500,
          padding: '40px 0px 0 0',
          fontSize: '1rem',
        }}
      >
        {i18n._(`Check proposed words`)}
      </Typography>
      <Typography variant="caption" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
        {i18n._(`Based on your level, the AI will suggest words to describe.`)}
      </Typography>
      <img
        src="/rolePlaysPublic/alias/options.webp"
        style={{
          width: '460px',
          maxWidth: 'calc(100dvw - 32px)',
          borderRadius: '10px',
          height: 'auto',
        }}
        alt={i18n._(`Alias Game options`)}
      />

      <Typography
        variant="h3"
        style={{
          fontWeight: 500,
          padding: '40px 0px 0 0',
          fontSize: '1rem',
        }}
      >
        {i18n._(`Record your description`)}
      </Typography>
      <Typography variant="caption" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
        {i18n._(`Describe the word you see on the screen without using the word itself!`)}
      </Typography>
      <img
        src="/rolePlaysPublic/alias/recording.webp"
        style={{
          width: '460px',
          maxWidth: 'calc(100dvw - 32px)',
          borderRadius: '10px',
          height: 'auto',
        }}
        alt={i18n._(`Alias Game Recording`)}
      />

      <Typography
        variant="h3"
        style={{
          fontWeight: 500,
          padding: '40px 0px 0 0',
          fontSize: '1rem',
        }}
      >
        {i18n._(`Have fun!`)}
      </Typography>
      <Typography variant="caption" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
        {i18n._(`Enjoy the game and see how the AI guesses your description!`)}
      </Typography>
      <img
        src="/rolePlaysPublic/alias/botThinking.webp"
        style={{
          width: '460px',
          maxWidth: 'calc(100dvw - 32px)',
          borderRadius: '10px',
          height: 'auto',
        }}
        alt={i18n._(`Robot Thinking`)}
      />
    </Stack>
  );
};
