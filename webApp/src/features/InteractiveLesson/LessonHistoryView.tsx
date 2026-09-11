'use client';

import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Button, Divider, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { LessonMarkdown } from './LessonMarkdown';
import { UserAudioPlayer } from './UserAudioPlayer';
import { scrollElementToStart } from './findScrollParent';
import { InteractiveLesson, isLessonPartWithAnswer } from './types';

export const LessonHistoryView = ({
  lessons,
}: {
  lessons: InteractiveLesson[];
}) => {
  const { i18n } = useLingui();
  const [openId, setOpenId] = useState<string | null>(lessons[0]?.id || null);
  const titleRefs = useRef(new Map<string, HTMLElement>());

  if (lessons.length === 0) {
    return (
      <Typography variant="body2" sx={{ opacity: 0.75 }} data-testid="interactive-lesson-history-empty">
        {i18n._('No previous lessons yet. Finish one to see it here.')}
      </Typography>
    );
  }

  return (
    <Stack sx={{ gap: '16px' }} data-testid="interactive-lesson-history-list">
      {lessons.map((lesson) => {
        const isOpen = openId === lesson.id;
        return (
          <Stack
            key={lesson.id}
            sx={{
              gap: '10px',
              padding: '14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', gap: '12px' }}>
              <Stack>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700 }}
                  data-testid={`interactive-lesson-history-title-${lesson.id}`}
                  ref={(node) => {
                    if (node) titleRefs.current.set(lesson.id, node);
                    else titleRefs.current.delete(lesson.id);
                  }}
                >
                  {lesson.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  {lesson.subTitle}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>
                  {new Date(lesson.completedAtIso || lesson.createdAtIso).toLocaleString()}
                </Typography>
              </Stack>
              <Button
                variant="text"
                color="info"
                data-testid={`interactive-lesson-history-open-${lesson.id}`}
                onClick={() => {
                  if (isOpen) {
                    setOpenId(null);
                    return;
                  }
                  flushSync(() => {
                    setOpenId(lesson.id);
                  });
                  scrollElementToStart(titleRefs.current.get(lesson.id) ?? null);
                }}
              >
                {isOpen ? i18n._('Hide') : i18n._('Open')}
              </Button>
            </Stack>

            {isOpen && (
              <Stack sx={{ gap: '14px' }}>
                {lesson.parts.map((part, index) => (
                  <Stack key={`${lesson.id}-${index}`} sx={{ gap: '8px' }}>
                    {index > 0 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                    <LessonMarkdown content={part.contentMD} />
                    {isLessonPartWithAnswer(part) && (
                      <Stack sx={{ gap: '6px' }}>
                        <Typography variant="body2">{part.userVoiceTranscript}</Typography>
                        {part.userAudioUrl && <UserAudioPlayer audioUrl={part.userAudioUrl} />}
                        <LessonMarkdown content={part.aiResultToUser} />
                      </Stack>
                    )}
                  </Stack>
                ))}
                {lesson.lessonResults && (
                  <Stack sx={{ gap: '10px' }}>
                    <LessonMarkdown content={lesson.lessonResults.motivationTextToUserMD} />
                    <LessonMarkdown content={lesson.lessonResults.whatWentWellMD} />
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
        );
      })}
    </Stack>
  );
};
