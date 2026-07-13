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
      <SectionHeader title={i18n._('Speaking with AI')} />
      <StoreCard
        textColor={'#fff'}
        backgroundColor={isCallStarting ? 'rgba(2, 133, 208, 0.42)' : 'rgba(2, 133, 208, 0.9)'}
        previewImageUrl={aiAvatar.photoUrls?.[0] || ''}
        label={'JUST TALK MODE'}
        title={i18n._('Conversation with AI')}
        subTitle={footnotePhrase}
        items={[]}
        itemsBackgroundColor={'rgba(0, 0, 0, 0.2)'}
        onClick={() => {
          startJustTalk();
        }}
        itemsViewMode={'list'}
      />
    </Stack>
  );
};
