import { Button, Stack, Typography } from '@mui/material';
import { LandPlot } from 'lucide-react';
import { useLingui } from '@lingui/react';
import { usePlan } from '../Plan/usePlan';
import { PlanElementMode } from '../Plan/types';
import { PlanCard } from '../Plan/PlanCard';
import { cardColors, modeCardProps } from '../Plan/data';
import { useMemo, useState } from 'react';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useUrlParam } from '../Url/useUrlParam';
import { CreatePersonalPlanModal } from './CreatePersonalPlanModal';
import { PlanSettingsMenu } from './PlanSettingsMenu';
import { useSettings } from '../Settings/useSettings';
import { SectionHeader } from './CartsHeader';
import { CardItem, StoreCard } from '../uiKit/Card/StoreCard';
import { voiceAvatarMap } from '../Conversation/CallMode/voiceAvatar';

export const PlanDashboardCards = () => {
  const { i18n } = useLingui();
  const plan = usePlan();
  const settings = useSettings();

  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);

  const isGoalSet = !!plan.activeGoal?.elements?.length;

  const modeLabels: Record<PlanElementMode, string> = {
    conversation: i18n._(`Conversation`),
    play: i18n._(`Role Play`),
    words: i18n._(`Words`),
    rule: i18n._(`Rule`),
  };

  const sortedElements = useMemo(() => {
    return plan.activeGoal?.elements || [];
  }, [plan.activeGoal?.elements]);

  let activeIndex: null | number = null;

  sortedElements.forEach((element, index) => {
    const isCompleted =
      plan.activeGoal?.progress?.find((part) => part.elementId === element.id)?.state ===
      'completed';
    if (!isCompleted && activeIndex === null) {
      activeIndex = index;
    }
  });
  const [isShowMoreModal, setIsShowMoreModal] = useUrlParam('showMoreModal');

  const doneLessonsCount = sortedElements.reduce((acc, element) => {
    const progress = plan.activeGoal?.progress?.find((part) => part.elementId === element.id);
    const isDone = progress?.state === 'completed';
    if (isDone) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const [isLearningPlanUpdating, setIsLearningPlanUpdating] = useState(false);

  const generateMoreLessons = async () => {
    if (!plan.activeGoal) {
      return;
    }

    try {
      setIsLearningPlanUpdating(true);

      await plan.generateMoreElements();

      setIsLearningPlanUpdating(false);
      setIsShowMoreModal(false);
    } catch (error) {
      alert(i18n._(`Something went wrong while generating more lessons. Please try again later.`));
      setIsLearningPlanUpdating(false);

      throw error;
    }
  };

  const minimumLessonsCountToExpand = 3;
  const isAbleToExpand = doneLessonsCount >= minimumLessonsCountToExpand;

  const nextElementId = plan.nextElement?.id;
  const voiceName = settings.voice;
  const aiAvatar = voiceAvatarMap[voiceName];

  return (
    <Stack gap="20px">
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <SectionHeader
          title={i18n._('Learning path')}
          subTitle={
            isGoalSet
              ? plan.activeGoal?.title || i18n._(`Goal`)
              : i18n._(`Start your way to fluency`)
          }
        />
        <PlanSettingsMenu onAddPlan={() => setIsCreatePlanOpen(true)} />
      </Stack>

      {plan.nextElement && nextElementId && (
        <Stack sx={{ gap: '10px' }}>
          <StoreCard
            badge={''}
            textColor={'#fff'}
            backgroundColor={'rgba(7, 7, 10, 0)'}
            onClick={() => plan.openElementModal(nextElementId)}
            itemsBackgroundColor={'#1F2025'}
            previewImageUrl={
              'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1783891013640-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png'
            }
            label={i18n._('Current Lesson').toUpperCase()}
            title={plan.nextElement.title}
            subTitle={plan.nextElement.description}
            items={sortedElements.map((planElement, index, all) => {
              const cardInfo = modeCardProps[planElement.mode];
              const colorIndex = index % cardColors.length;
              const cardColor = cardColors[colorIndex];
              const elementsWithSameMode =
                sortedElements.filter((element) => element.mode === planElement.mode) || [];
              const currentElementIndex = elementsWithSameMode.findIndex(
                (element) => element.id === planElement.id,
              );

              const imageVariants =
                planElement.mode === 'conversation' ? aiAvatar.photoUrls : cardInfo.imgUrl;
              const imageIndex = currentElementIndex % imageVariants.length;
              const imageUrl = imageVariants[imageIndex];

              const isDone =
                plan.activeGoal?.progress?.find((part) => part.elementId === planElement.id)
                  ?.state === 'completed';

              const isActive = index === activeIndex;

              const item: CardItem = {
                title: planElement.title,
                subTitle: modeLabels[planElement.mode],
                iconName:
                  planElement.mode === 'rule'
                    ? 'book-open-text'
                    : planElement.mode === 'words'
                      ? 'type'
                      : planElement.mode === 'play'
                        ? 'venetian-mask'
                        : 'messages-square',
                iconBgColor: isDone ? '#16c476' : isActive ? 'rgba(244, 9, 9, 0.72)' : '#677b82',
                actionButtonTitle: isActive ? i18n._('Continue') : i18n._('Open'),
                onClick: function (): void {
                  plan.openElementModal(planElement.id);
                },
              };
              return item;
            })}
            itemsViewMode={'list'}
          />
        </Stack>
      )}

      {(!isGoalSet || !plan.activeGoal) && (
        <Button
          startIcon={<LandPlot size={'21px'} />}
          onClick={() => setIsCreatePlanOpen(true)}
          sx={{
            padding: '10px 20px',
          }}
          variant="outlined"
          data-testid="create-personal-plan-open"
        >
          {i18n._('Create a plan')}
        </Button>
      )}

      {isGoalSet && plan.activeGoal && !(plan.nextElement && nextElementId) && (
        <Stack
          sx={{
            gap: '20px',
            width: '100%',
          }}
        >
          {sortedElements.map((planElement, index, all) => {
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

            const isDone =
              plan.activeGoal?.progress?.find((part) => part.elementId === planElement.id)
                ?.state === 'completed';

            const isActive = index === activeIndex;

            return (
              <PlanCard
                key={planElement.id}
                delayToShow={index * 80}
                title={planElement.title}
                subTitle={modeLabels[planElement.mode]}
                details={planElement.details}
                isDone={isDone}
                isActive={isActive}
                isContinueLabel={isActive && index > 0}
                startColor={cardColor.startColor}
                endColor={cardColor.endColor}
                bgColor={cardColor.bgColor}
                index={index}
                isLast={index === all.length - 1}
                onClick={() => plan.openElementModal(planElement.id)}
                icon={
                  <Stack>
                    <Stack className="avatar">
                      <img src={imageUrl} className="avatarContent" alt="" />
                    </Stack>
                  </Stack>
                }
              />
            );
          })}
        </Stack>
      )}

      {isCreatePlanOpen && (
        <CreatePersonalPlanModal onClose={() => setIsCreatePlanOpen(false)} />
      )}

      {isShowMoreModal && (
        <CustomModal isOpen={true} onClose={() => setIsShowMoreModal(false)}>
          <Stack
            sx={{
              gap: '10px',
              alignItems: 'center',
              width: '100%',
              maxWidth: '600px',
            }}
          >
            <Stack
              sx={{
                gap: '20px',
              }}
            >
              <Typography
                align="center"
                variant="caption"
                sx={{
                  color: `rgba(255, 255, 255, 0.5)`,
                }}
              >
                {i18n._(`More unique lessons`)}
              </Typography>
              <Stack>
                <Typography variant="h4" align="center" component="h2" className="decor-text">
                  {plan.activeGoal?.title || i18n._(`Goal`)}
                </Typography>
              </Stack>
            </Stack>

            <Stack
              sx={{
                gap: '2px',
              }}
            >
              <Button
                sx={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '10px 20px',
                }}
                onClick={generateMoreLessons}
                disabled={!isAbleToExpand || isLearningPlanUpdating}
                variant="contained"
                color="info"
                size="large"
              >
                {isLearningPlanUpdating
                  ? i18n._(`Generating...`)
                  : i18n._(`Generate more unique lessons`)}
              </Button>
              {!isAbleToExpand && (
                <Typography
                  align="center"
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  {i18n._(
                    `In order to generate more lessons, you need to complete at least 3 lessons`,
                  )}
                </Typography>
              )}
            </Stack>
          </Stack>
        </CustomModal>
      )}
    </Stack>
  );
};
