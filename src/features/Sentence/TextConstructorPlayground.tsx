'use client';

import { Stack } from '@mui/material';
import { useState } from 'react';
import { TextConstructor } from './TextConstructor';

const sentences = [
  'Lucas wakes up early.',
  'Before sunrise, he reviews his notes and writes a short plan for the day so he can focus on the most difficult tasks first.',
  'Then he goes to school.',
  'Although mathematics is his favorite subject, he also enjoys history because the teacher connects past events to modern life with vivid stories and thoughtful questions.',
  'Classes are intense.',
  'During lunch, Lucas and his friends discuss a science project that requires careful research, clear communication, and a final presentation in front of the whole class.',
  'After school, he practices English for thirty minutes.',
  'Some exercises are easy, but others demand precise grammar, richer vocabulary, and patient revision until every sentence sounds natural and complete.',
  'He is tired but motivated.',
  'By the end of the week, Lucas can explain complex ideas more confidently, and he feels proud because steady effort has turned small daily habits into real progress.',
];

const sentencesTranslates = [
  'Лукас просыпается рано.',
  'До рассвета он повторяет свои записи и составляет короткий план на день, чтобы сначала сосредоточиться на самых сложных задачах.',
  'Потом он идет в школу.',
  'Хотя математика — его любимый предмет, ему также нравится история, потому что учитель связывает события прошлого с современной жизнью с помощью ярких рассказов и продуманных вопросов.',
  'Занятия проходят интенсивно.',
  'Во время обеда Лукас и его друзья обсуждают научный проект, который требует тщательного исследования, ясной коммуникации и итоговой презентации перед всем классом.',
  'После школы он практикует английский тридцать минут.',
  'Некоторые упражнения легкие, но другие требуют точной грамматики, более богатого словаря и терпеливой доработки, пока каждое предложение не начнет звучать естественно и завершенно.',
  'Он устал, но мотивирован.',
  'К концу недели Лукас может увереннее объяснять сложные идеи и чувствует гордость, потому что постоянные усилия превратили небольшие ежедневные привычки в реальный прогресс.',
];

export function TextConstructorPlayground() {
  const [progress, setProgress] = useState(sentences.join('\n\n'));

  return (
    <Stack sx={{ width: '100%' }}>
      <TextConstructor
        sentences={sentences}
        sentencesTranslates={sentencesTranslates}
        progress={progress}
        onContinue={setProgress}
      />
    </Stack>
  );
}
