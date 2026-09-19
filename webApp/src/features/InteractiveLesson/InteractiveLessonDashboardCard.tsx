'use client';

import { useLingui } from '@lingui/react';
import { InteractiveLessonDashboardView } from './InteractiveLessonDashboardView';
import { useInteractiveLesson } from './useInteractiveLesson';

export const InteractiveLessonDashboardCard = () => {
  const { i18n } = useLingui();
  const lesson = useInteractiveLesson();

  const current = lesson.currentLesson;

  const cardTitle = lesson.isDoneToday
    ? current?.title || i18n._('One pattern. Real speaking practice.')
    : current?.title || i18n._('One pattern. Real speaking practice.');
  const cardSubTitle = current?.subTitle || i18n._('Learn it, say it, and get feedback.');

  return (
    <InteractiveLessonDashboardView
      title={i18n._('Daily speaking lesson')}
      subTitle={i18n._('Practice grammar in real speech.')}
      cardTitle={cardTitle}
      cardSubTitle={cardSubTitle}
      progressButtonTitle={i18n._('Progress')}
      badge={lesson.isDoneToday ? i18n._('Done today') : undefined}
      isDoneToday={lesson.isDoneToday}
      onOpen={lesson.openLesson}
      onProgressClick={lesson.openProgress}
    />
  );
};
