'use client';

import { useLingui } from '@lingui/react';
import { InteractiveLessonDashboardView } from './InteractiveLessonDashboardView';
import { useInteractiveLesson } from './useInteractiveLesson';

export const InteractiveLessonDashboardCard = () => {
  const { i18n } = useLingui();
  const lesson = useInteractiveLesson();

  const current = lesson.currentLesson;
  const cardTitle = lesson.isDoneToday
    ? current?.title || i18n._('Today’s lesson is done')
    : current?.title || i18n._('Today’s lesson');
  const cardSubTitle = current?.subTitle || i18n._('Read a rule, then speak your answers.');

  return (
    <InteractiveLessonDashboardView
      title={i18n._('Interactive Lesson')}
      subTitle={i18n._('Read, speak, and build a daily speaking habit.')}
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
