'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { CustomModal } from '../../uiKit/Modal/CustomModal';
import { CommunitySpace } from '../types';
import { useCommunitySpace } from './useCommunitySpace';

interface SpaceEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'create' | 'Edit';
  space?: CommunitySpace | null;
}

export const SpaceEditorModal = ({ isOpen, onClose, type, space }: SpaceEditorModalProps) => {
  const { i18n } = useLingui();
  const { saveSpace, deleteSpace } = useCommunitySpace();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalTitle = useMemo(() => {
    return type === 'create' ? i18n._('Create New Space') : i18n._('Edit Space');
  }, [i18n, type]);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(space?.title || '');
    setDescription(space?.description || '');
  }, [isOpen, space?.description, space?.title]);

  const onSave = async () => {
    if (!title.trim()) {
      window.alert(i18n._('Please enter a space title'));
      return;
    }

    setIsSubmitting(true);
    await saveSpace({
      id: type === 'Edit' ? space?.id : undefined,
      title,
      description,
    });
    setIsSubmitting(false);
    onClose();
  };

  const onDelete = async () => {
    if (!space?.id) return;
    const isConfirmed = window.confirm(i18n._('Are you sure you want to delete this space?'));
    if (!isConfirmed) return;

    setIsSubmitting(true);
    await deleteSpace(space.id);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return <></>;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <Stack
        sx={{
          width: '100%',
          maxWidth: '560px',
          gap: '16px',
        }}
      >
        <Typography variant="h3">{modalTitle}</Typography>

        <TextField
          label={i18n._('Title')}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={isSubmitting}
          fullWidth
        />

        <TextField
          label={i18n._('Description')}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSubmitting}
          multiline
          minRows={3}
          fullWidth
        />

        <Stack
          sx={{
            flexDirection: 'row',
            gap: '10px',
            justifyContent: 'flex-end',
          }}
        >
          {type === 'Edit' && (
            <Button color="error" variant="outlined" onClick={onDelete} disabled={isSubmitting}>
              {i18n._('Delete Space')}
            </Button>
          )}
          <Button onClick={onClose} disabled={isSubmitting}>
            {i18n._('Cancel')}
          </Button>
          <Button variant="contained" onClick={onSave} disabled={isSubmitting}>
            {type === 'create' ? i18n._('Create Space') : i18n._('Save Changes')}
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
