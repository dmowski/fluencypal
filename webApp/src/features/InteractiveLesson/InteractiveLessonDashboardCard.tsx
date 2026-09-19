'use client';

import { useLingui } from '@lingui/react';
import { InteractiveLessonDashboardView } from './InteractiveLessonDashboardView';
import { useInteractiveLesson } from './useInteractiveLesson';

export const InteractiveLessonDashboardCard = () => {
  const { i18n } = useLingui();
  const lesson = useInteractiveLesson();

  const current = lesson.currentLesson;
  const isDefaultMessages = false;
  const defaultCardTitle = i18n._('One pattern. Real speaking practice.');
  const defaultCardSubTitle = i18n._('Learn it, say it, and get feedback.');

  const cardTitle = isDefaultMessages
    ? defaultCardTitle
    : lesson.isDoneToday
      ? current?.title || defaultCardTitle
      : current?.title || defaultCardTitle;
  const cardSubTitle = isDefaultMessages
    ? defaultCardSubTitle
    : current?.subTitle || defaultCardSubTitle;

  return (
    <InteractiveLessonDashboardView
      title={i18n._('Daily speaking lesson')}
      subTitle={i18n._('Practice grammar in real speech.')}
      cardTitle={cardTitle}
      cardSubTitle={cardSubTitle}
      progressButtonTitle={i18n._('Progress')}
      badge={lesson.isDoneToday ? i18n._('Done today') : i18n._('Recommended')}
      isDoneToday={lesson.isDoneToday}
      onOpen={lesson.openLesson}
      onProgressClick={lesson.openProgress}
    />
  );
};
