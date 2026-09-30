'use client';

import { Button, Stack, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { deleteDoc, setDoc } from 'firebase/firestore';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { useAuth } from '@/features/Auth/useAuth';
import { useGame } from '@/features/Game/useGame';
import { db } from '@/features/Firebase/firebaseDb';
import { sendFeedbackMessageRequest } from '@/app/api/telegram/sendFeedbackMessageRequest';
import { dailyQuestionImageUrls, isDailyQuestionImageUrl } from './data';
import { UserDailyQuestion } from './types';
import { userDailyQuestionDayKey, userDailyQuestionId } from './userDailyQuestion';

const TITLE_MAX = 180;
const DESCRIPTION_MAX = 1500;

export const UserDailyQuestionFormModal = ({
  onClose,
  existing,
}: {
  onClose: () => void;
  existing?: UserDailyQuestion | null;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const game = useGame();
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = Boolean(existing);
  const hasImage = isDailyQuestionImageUrl(imageUrl);

  const onSubmit = async () => {
    const nextTitle = title.trim();
    const nextDescription = description.trim();
    if (!auth.uid || !nextTitle || !nextDescription || !isDailyQuestionImageUrl(imageUrl) || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const nowIso = new Date().toISOString();
      const dayKey = existing?.dayKey || userDailyQuestionDayKey();
      const id = existing?.id || userDailyQuestionId(auth.uid, dayKey);
      const question: UserDailyQuestion = {
        id,
        authorUserId: existing?.authorUserId || auth.uid,
        title: nextTitle.slice(0, TITLE_MAX),
        description: nextDescription.slice(0, DESCRIPTION_MAX),
        imageUrl,
        dayKey,
        createdAtIso: existing?.createdAtIso || nowIso,
        updatedAtIso: nowIso,
      };
      const ref = db.documents.userDailyQuestion(id);
      if (!ref) {
        throw new Error('Missing daily question ref');
      }
      await setDoc(ref, question);

      if (!isEdit && !auth.isFounder) {
        const url = 'https://app.fluencypal.com/practice?dailyQuestions=true';
        void sendFeedbackMessageRequest(
          {
            message: `🆕 New daily question by ${game.getUserName(question.authorUserId)}:\n\n${question.title}\n${question.description}\n\n${url}`,
          },
          await auth.getToken(),
        ).catch((error) => {
          console.error('Failed to send daily question notification', error);
        });
      }
      onClose();
    } catch (error) {
      console.error(error);
      alert(i18n._('Could not save your question. Please try again.'));
      setIsSaving(false);
    }
  };

  return (
    <CustomModal isOpen={true} onClose={onClose} zIndex={1200}>
      <Stack
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
        sx={{ gap: '20px', width: '100%', maxWidth: '600px' }}
      >
        <Stack>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            {isEdit ? i18n._('Edit question') : i18n._('Add my question')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {i18n._('A question other learners can answer today.')}
          </Typography>
        </Stack>
        <TextField
          value={title}
          required
          label={i18n._('Question')}
          onChange={(event) => setTitle(event.target.value)}
          inputProps={{ maxLength: TITLE_MAX }}
        />
        <TextField
          value={description}
          required
          label={i18n._('Details')}
          onChange={(event) => setDescription(event.target.value)}
          multiline
          rows={4}
          inputProps={{ maxLength: DESCRIPTION_MAX }}
        />
        <Stack sx={{ gap: '10px' }}>
          <Typography variant="body1">{i18n._('Choose an image')}</Typography>
          <Stack sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
            {dailyQuestionImageUrls.map((url, index) => {
              const selected = imageUrl === url;
              return (
                <Stack
                  key={url}
                  component="button"
                  type="button"
                  aria-label={i18n._('Image {number}', { number: index + 1 })}
                  aria-pressed={selected}
                  onClick={() => setImageUrl(url)}
                  sx={{
                    width: '88px',
                    height: '64px',
                    padding: 0,
                    overflow: 'hidden',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: selected ? '2px solid rgb(96, 165, 250)' : '2px solid transparent',
                  }}
                >
                  <Stack
                    component="img"
                    src={url}
                    alt=""
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Stack>
              );
            })}
          </Stack>
        </Stack>
        <Button
          type="submit"
          variant="contained"
          disabled={isSaving || !title.trim() || !description.trim() || !hasImage}
        >
          {isEdit ? i18n._('Save') : i18n._('Publish')}
        </Button>
      </Stack>
    </CustomModal>
  );
};

export const deleteUserDailyQuestion = async (questionId: string) => {
  const ref = db.documents.userDailyQuestion(questionId);
  if (!ref) return;
  await deleteDoc(ref);
};
