import { Button, Stack, Typography } from '@mui/material';
import { getI18nInstance } from '@/appRouterI18n';
import { getAppUrlStart, getUrlStart } from '@/features/Lang/getUrlStart';
import { fullLanguageName, SupportedLanguage } from '@/features/Lang/lang';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { PublicSpeakingClub } from './publicClubs';

const cardLink = (lang: SupportedLanguage, slug: string) =>
  `${getUrlStart(lang)}speaking-club/${slug}`;

const coverImage = (value: string): string | undefined => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || /[\s()"']/.test(value)) return undefined;
    const hostOk =
      url.hostname === 'storage.googleapis.com' ||
      url.hostname === 'firebasestorage.googleapis.com';
    if (!hostOk || !decodeURIComponent(url.pathname).includes('publicImages')) return undefined;
    return `url("${value}")`;
  } catch {
    return undefined;
  }
};

export const SpeakingClubList = ({
  lang,
  clubs,
}: {
  lang: SupportedLanguage;
  clubs: PublicSpeakingClub[];
}) => {
  const i18n = getI18nInstance(lang);
  return (
    <Stack
      component="main"
      data-testid="speaking-club-list"
      sx={{
        width: '100%',
        maxWidth: 880,
        margin: '0 auto',
        padding: '140px 16px 80px',
        gap: '16px',
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: 800 }}>
        {i18n._('Speaking clubs')}
      </Typography>
      <Typography sx={{ opacity: 0.8 }}>
        {i18n._(
          'Practice a language out loud with a small group. Read what the room talks about, then join with a short voice introduction.',
        )}
      </Typography>
      {clubs.length === 0 ? (
        <Typography>{i18n._('No public rooms yet. Check back soon.')}</Typography>
      ) : null}
      {clubs.map((club) => (
        <Stack
          key={club.slug}
          component="a"
          href={cardLink(lang, club.slug)}
          sx={{
            minHeight: 160,
            borderRadius: '16px',
            padding: '16px',
            color: 'inherit',
            textDecoration: 'none',
            justifyContent: 'flex-end',
            backgroundColor: '#243044',
            backgroundImage: coverImage(club.previewImageUrl)
              ? `linear-gradient(180deg, rgba(10,14,22,0.2), rgba(10,14,22,0.82)), ${coverImage(club.previewImageUrl)}`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Typography sx={{ fontSize: '24px', fontWeight: 800 }}>{club.title}</Typography>
          <Typography>{club.subtitle}</Typography>
          <Typography sx={{ fontSize: '14px', opacity: 0.85 }}>
            {fullLanguageName[club.languageCode]}
            {' · '}
            {club.memberCount === 1
              ? i18n._('1 person')
              : i18n._('{count} people', { count: club.memberCount })}
            {' · '}
            {i18n._('{count} messages this week', { count: club.messagesLast7Days })}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
};

export const SpeakingClubDetail = ({
  lang,
  club,
}: {
  lang: SupportedLanguage;
  club: PublicSpeakingClub;
}) => {
  const i18n = getI18nInstance(lang);
  const review =
    club.reviewMode === 'alexOnly'
      ? i18n._('Alex reviews new people')
      : i18n._('Everyone in the room reviews new people');
  return (
    <Stack
      component="main"
      data-testid="speaking-club-detail"
      sx={{
        width: '100%',
        maxWidth: 880,
        margin: '0 auto',
        padding: '140px 16px 80px',
        gap: '16px',
      }}
    >
      <Stack
        sx={{
          height: 220,
          borderRadius: '16px',
          backgroundColor: '#243044',
          backgroundImage: coverImage(club.previewImageUrl),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Typography variant="h3" sx={{ fontWeight: 800 }}>
        {club.title}
      </Typography>
      <Typography sx={{ opacity: 0.85 }}>{club.subtitle}</Typography>
      <Typography sx={{ fontWeight: 700 }}>
        {i18n._('{language} speaking club', {
          language: fullLanguageName[club.languageCode],
        })}
      </Typography>
      <Typography>
        {club.memberCount === 1
          ? i18n._('1 person')
          : i18n._('{count} people', { count: club.memberCount })}
        {' · '}
        {i18n._('{count} messages this week', { count: club.messagesLast7Days })}
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>{review}</Typography>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        {i18n._('What we usually talk about')}
      </Typography>
      <Markdown safe>{club.discussMarkdown}</Markdown>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        {i18n._('Room rules')}
      </Typography>
      <Markdown safe>{club.rulesMarkdown}</Markdown>
      <Button
        href={`${getAppUrlStart(lang)}practice?voiceChat=true&voiceRoom=${club.slug}`}
        variant="contained"
        color="info"
        sx={{
          alignSelf: 'flex-start',
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 700,
        }}
      >
        {i18n._('Join this room')}
      </Button>
    </Stack>
  );
};

export const SpeakingClubMissing = ({
  lang,
  clubs,
}: {
  lang: SupportedLanguage;
  clubs: PublicSpeakingClub[];
}) => {
  const i18n = getI18nInstance(lang);
  return (
    <Stack sx={{ width: '100%', gap: '8px' }}>
      <Stack sx={{ width: '100%', maxWidth: 880, margin: '0 auto', padding: '40px 16px 0' }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }} data-testid="speaking-club-missing">
          {i18n._('We could not find that room')}
        </Typography>
        <Typography sx={{ opacity: 0.8, marginTop: '8px' }}>
          {i18n._('It may have been closed. You can still join one of the other rooms.')}
        </Typography>
      </Stack>
      <SpeakingClubList lang={lang} clubs={clubs} />
    </Stack>
  );
};
