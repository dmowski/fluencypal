import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';
import { useState } from 'react';
import { useSettings } from '../Settings/useSettings';
import { voiceAvatarMap } from '../Conversation/CallMode/voiceAvatar';
import { StoreCard } from '../uiKit/Card/StoreCard';
import { SectionHeader } from './CartsHeader';
import { useJustTalk } from '../Conversation/useJustTalk';

export const JustTalkCard = () => {
  const { i18n } = useLingui();

  const { startJustTalk, isCallStarting } = useJustTalk();
  const [footnotePhraseIndex] = useState(new Date().getDate());

  const settings = useSettings();
  const voiceName = settings.userSettings?.teacherVoice || 'shimmer';
  const aiAvatar = voiceAvatarMap[voiceName];
  const secondPhotoUrl = aiAvatar.photoUrls?.[1] || aiAvatar.photoUrls?.[0] || '';

  const funnyPhrases = aiAvatar.funnyPhrases;
  const footnotePhrase = funnyPhrases[footnotePhraseIndex % funnyPhrases.length];

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader title={i18n._('Speaking')} subTitle={footnotePhrase} />
      <StoreCard
        textColor={'#fff'}
        backgroundColor={isCallStarting ? 'rgba(2, 134, 208, .54)' : 'rgba(2, 134, 208, .94)'}
        previewImageUrl={aiAvatar.photoUrls?.[0] || ''}
        label={'JUST TALK MODE'}
        title={i18n._('Conversation with AI')}
        subTitle={i18n._(
          "Start a casual call to practice your communication skills. This is a no-strings-attached conversation if you'd like to chat in a casual setting.",
        )}
        items={[
          {
            title: voiceName.charAt(0).toUpperCase() + voiceName.slice(1),
            subTitle: i18n._('Your AI Speech Partner'),
            imageUrl: secondPhotoUrl,
            actionButtonTitle: isCallStarting ? i18n._('Loading...') : i18n._('Open'),
            onClick: () => {
              startJustTalk();
            },
          },
        ]}
        itemsBackgroundColor={'rgba(0, 0, 0, 0.2)'}
        onClick={() => {
          startJustTalk();
        }}
        itemsViewMode={'list'}
      />
    </Stack>
  );
};
