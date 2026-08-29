'use client';

import { useState } from 'react';
import { Button, Divider, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SupportedLanguage } from '@/features/Lang/lang';
import { NewsContentWithParagraphs } from '@/features/News/NewsContentWithParagraphs';
import { UserAudioPlayer } from './UserAudioPlayer';
import { InteractiveLesson, isLessonPartWithAnswer } from './types';

export const LessonHistoryView = ({
  lessons,
  languageCode,
}: {
  lessons: InteractiveLesson[];
  languageCode: SupportedLanguage;
}) => {
  const { i18n } = useLingui();
  const [openId, setOpenId] = useState<string | null>(lessons[0]?.id || null);

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
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
                onClick={() => setOpenId(isOpen ? null : lesson.id)}
              >
                {isOpen ? i18n._('Hide') : i18n._('Open')}
              </Button>
            </Stack>

            {isOpen && (
              <Stack sx={{ gap: '14px' }}>
                {lesson.parts.map((part, index) => (
                  <Stack key={`${lesson.id}-${index}`} sx={{ gap: '8px' }}>
                    {index > 0 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                    <NewsContentWithParagraphs content={part.contentMD} languageCode={languageCode} />
                    {isLessonPartWithAnswer(part) && (
                      <Stack sx={{ gap: '6px' }}>
                        <Typography variant="body2">{part.userVoiceTranscript}</Typography>
                        {part.userAudioUrl && <UserAudioPlayer audioUrl={part.userAudioUrl} />}
                        <Typography variant="body2" sx={{ opacity: 0.85 }}>
                          {part.aiResultToUser}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                ))}
                {lesson.lessonResults && (
                  <Stack sx={{ gap: '10px' }}>
                    <NewsContentWithParagraphs
                      content={lesson.lessonResults.motivationTextToUserMD}
                      languageCode={languageCode}
                    />
                    <NewsContentWithParagraphs
                      content={lesson.lessonResults.whatWentWellMD}
                      languageCode={languageCode}
                    />
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
