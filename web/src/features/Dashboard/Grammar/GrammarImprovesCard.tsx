'use client';

import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';
import { useMemo, useState } from 'react';
import { useSettings } from '@/features/Settings/useSettings';
import { SectionHeader } from '../CartsHeader';
import { CardItem, StoreCard } from '@/features/uiKit/Card/StoreCard';
import { IconName } from 'lucide-react/dynamic';
import { useGrammarImprovement } from './useGrammarImprovement';

const limitCount = 3;

const improvementsIcons: {
  color: string;
  iconName: IconName;
}[] = [
  { color: '#335FFC', iconName: 'star' },
  { color: '#FF6AD8', iconName: 'heart' },
  { color: '#00C2FF', iconName: 'thumbs-up' },
  { color: '#FF8A00', iconName: 'zap' },
  { color: '#00FFAB', iconName: 'smile' },
];

export const GrammarImprovesCardUi = () => {
  const { i18n } = useLingui();
  const { grammarPoints, titleMap, isLoadingNew, handleOpenModal, showAvailable } =
    useGrammarImprovement();

  const [showAll, setShowAll] = useState(false);
  const limit = showAll ? grammarPoints.length : limitCount;
  const isLimited = grammarPoints.length > limitCount && !showAll;

  const items: CardItem[] = useMemo(() => {
    const newItems: CardItem[] = [];

    grammarPoints.slice(0, limit).forEach((record, index) => {
      const icon = improvementsIcons[index % improvementsIcons.length];
      const fullTitle = titleMap[record.value]?.title || i18n._(`Loading...`);
      const subTitle = titleMap[record.value]?.subTitle || '...';

      newItems.push({
        title: fullTitle,
        subTitle: subTitle,
        iconName: 'book',
        iconBgColor: icon.color,
        actionButtonTitle: i18n._('Open'),
        onClick: function (): void {
          handleOpenModal(index);
        },
      });
    });

    if (isLimited) {
      newItems.push({
        title: i18n._('More improvements'),
        subTitle: i18n._('Show all your grammar improvements.'),
        iconName: 'eye',
        iconBgColor: '#888',
        actionButtonTitle: i18n._('More...'),
        onClick: function (): void {
          setShowAll(true);
        },
      });
    }

    return newItems;
  }, [grammarPoints.length, titleMap, limit, isLimited]);

  if (isLoadingNew) {
    return (
      <Stack
        sx={{
          width: '100dvw',
          height: '100dvh',
          backgroundColor: '#181818',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
        }}
      />
    );
  }

  return (
    <Stack sx={{ gap: '20px' }}>
      <SectionHeader
        title={i18n._('Grammar Improvements')}
        subTitle={i18n._(
          'Personalized explanations and examples to help you understand and improve your grammar.',
        )}
      />

      <StoreCard
        textColor={'#fff'}
        backgroundColor={'#6A5439'}
        previewImageUrl={
          'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773858639762-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png'
        }
        label={i18n._('PRACTICE, IMPROVE, REPEAT')}
        title={i18n._('Enough with speaking? Time to improve!')}
        items={items}
        emptyItemsStateText={i18n._(
          'No grammar mistakes found. Keep practicing to see improvements here!',
        )}
        itemsBackgroundColor={'rgba(45, 45, 46, 0.8)'}
        onClick={showAvailable}
        itemsViewMode={'list'}
      />
    </Stack>
  );
};

export const GrammarImprovesCard = () => {
  const settings = useSettings();
  if (settings.loading) return <></>;
  return <GrammarImprovesCardUi />;
};
