'use client';
import { Stack } from '@mui/material';
import { useLingui } from '@lingui/react';

import { PlanCard } from '@/features/Plan/PlanCard';
import { GoalPlan, PlanElementMode } from '@/features/Plan/types';
import { cardColors, modeCardProps } from '@/features/Plan/data';

interface PlanPreviewProps {
  plan: GoalPlan;
}

export const PlanPreview = ({ plan }: PlanPreviewProps) => {
  const { i18n } = useLingui();

  const modeLabels: Record<PlanElementMode, string> = {
    conversation: i18n._(`Conversation`),
    play: i18n._(`Role Play`),
    words: i18n._(`Words`),
    rule: i18n._(`Concept`),
  };

  return (
    <Stack
      sx={{
        width: '100%',
      }}
    >
      <Stack
        sx={{
          gap: '15px',
        }}
      >
        {plan.elements.map((planElement, index, sortedElements) => {
          const cardInfo = modeCardProps[planElement.mode];
          const colorIndex = index % cardColors.length;
          const cardColor = cardColors[colorIndex];
          const elementsWithSameMode =
            sortedElements.filter((element) => element.mode === planElement.mode) || [];
          const currentElementIndex = elementsWithSameMode.findIndex(
            (element) => element.id === planElement.id,
          );

          const imageVariants = cardInfo.imgUrl;
          const imageIndex = currentElementIndex % imageVariants.length;
          const imageUrl = imageVariants[imageIndex];
          return (
            <Stack key={index} sx={{}}>
              <PlanCard
                key={planElement.id}
                delayToShow={index * 80}
                title={planElement.title}
                subTitle={modeLabels[planElement.mode]}
                details={planElement.details}
                isDone={false}
                isActive={false}
                isContinueLabel={false}
                viewOnly
                startColor={cardColor.startColor}
                endColor={cardColor.endColor}
                bgColor={cardColor.bgColor}
                isLast={index === sortedElements.length - 1}
                icon={
                  <Stack>
                    <Stack className="avatar">
                      <img src={imageUrl} alt="" />
                    </Stack>
                  </Stack>
                }
              />
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
};
