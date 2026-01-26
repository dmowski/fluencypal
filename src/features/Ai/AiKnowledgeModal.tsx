'use client';

import { useEffect, useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useAiUserInfo } from './useAiUserInfo';
import { AiKnowledgeRecordRow } from './AiKnowledgeRecordRow';
import { AiKnowledgeNewRecord } from './AiKnowledgeNewRecord';

interface AiKnowledgeModalProps {
  onClose: () => void;
}

export const AiKnowledgeModal = ({ onClose }: AiKnowledgeModalProps) => {
  const { i18n } = useLingui();
  const aiUserInfo = useAiUserInfo();

  const recordsSignature = aiUserInfo.userInfo?.records?.join('|') || '';

  const [recordsDraft, setRecordsDraft] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setRecordsDraft(aiUserInfo.userInfo?.records || []);
  }, [recordsSignature, aiUserInfo.userInfo?.records]);

  const persistRecords = async (nextRecords: string[]) => {
    setRecordsDraft(nextRecords);
    setIsSaving(true);
    try {
      await aiUserInfo.setUserRecords(nextRecords);
    } catch (error) {
      console.error('Error saving AI user records', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRecord = async (index: number, value: string) => {
    const trimmedRecord = (value || '').trim();
    if (!trimmedRecord) {
      return handleDeleteRecord(index);
    }

    const nextRecords = recordsDraft.map((record, i) => (i === index ? trimmedRecord : record));
    await persistRecords(nextRecords);
  };

  const handleDeleteRecord = async (index: number) => {
    const nextRecords = recordsDraft.filter((_, i) => i !== index);
    await persistRecords(nextRecords);
  };

  const hasRecords = recordsDraft.length > 0;

  return (
    <CustomModal isOpen={true} onClose={onClose}>
      <Stack
        sx={{
          gap: '30px',
          maxWidth: '700px',
          padding: '20px 0px 30px 0px',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        <Stack>
          <Typography variant="h5">{i18n._('AI knowledge about you')}</Typography>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.7,
            }}
          >
            {i18n._('Review, edit, or add the notes AI uses about you.')}
          </Typography>
        </Stack>

        <Stack
          sx={{
            gap: '12px',
            width: '100%',
          }}
        >
          {!hasRecords && (
            <Typography
              variant="body2"
              sx={{
                opacity: 0.7,
              }}
            >
              {i18n._('No notes yet. Add a few details so your AI teacher knows you better.')}
            </Typography>
          )}

          {recordsDraft.map((record, index) => (
            <AiKnowledgeRecordRow
              key={`record-${index}`}
              record={record}
              index={index}
              onSave={handleSaveRecord}
              onDelete={handleDeleteRecord}
              disabled={isSaving}
              i18nSave={i18n._('Save')}
              i18nDelete={i18n._('Delete')}
              i18nCancel={i18n._('Cancel')}
              i18nEdit={i18n._('Edit')}
            />
          ))}
        </Stack>

        <AiKnowledgeNewRecord
          disabled={isSaving}
          onAdd={async (value) => {
            if (!value.trim()) return;
            await persistRecords([...recordsDraft, value.trim()]);
          }}
          addLabel={i18n._('Add note')}
          heading={i18n._('Add new note')}
          placeholder={i18n._("Example: I'm preparing for a business trip to Berlin")}
          cancelLabel={i18n._('Cancel')}
        />

        <Stack
          direction="row"
          sx={{
            justifyContent: 'flex-end',
            width: '100%',
          }}
        >
          <Button variant="outlined" onClick={onClose} disabled={isSaving}>
            {i18n._('Close')}
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
