'use client';

import { useRef } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useLingui } from '@lingui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RichTextEditor } from '@/features/Chat/RichTextEditor';
import { RoomDraft, RoomReviewMode } from '../types';

export const RoomForm = ({
  draft,
  onChange,
  onCreatePictures,
  onShowMore,
  isCreatingPictures,
  onSubmit,
  submitLabel,
  isSaving,
  error,
}: {
  draft: RoomDraft;
  onChange: (draft: RoomDraft) => void;
  onCreatePictures: () => void;
  onShowMore: () => void;
  isCreatingPictures: boolean;
  onSubmit: () => void;
  submitLabel: string;
  isSaving: boolean;
  error: string;
}) => {
  const { i18n } = useLingui();
  const scroller = useRef<HTMLDivElement | null>(null);
  const set = (patch: Partial<RoomDraft>) => onChange({ ...draft, ...patch });
  const canPicture = draft.title.trim().length >= 2 && draft.subtitle.trim().length >= 2;

  return (
    <Stack data-testid="voice-room-form" sx={{ width: '100%', maxWidth: 760, gap: '16px' }}>
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        {submitLabel}
      </Typography>
      <TextField
        label={i18n._('Room name')}
        value={draft.title}
        onChange={(event) => set({ title: event.target.value })}
        onBlur={() => {
          if (canPicture && draft.previewUrls.length === 0) onCreatePictures();
        }}
        slotProps={{ htmlInput: { 'data-testid': 'voice-room-title', maxLength: 80 } }}
      />
      <TextField
        label={i18n._('Short description')}
        value={draft.subtitle}
        onChange={(event) => set({ subtitle: event.target.value })}
        onBlur={() => {
          if (canPicture && draft.previewUrls.length === 0) onCreatePictures();
        }}
        slotProps={{ htmlInput: { 'data-testid': 'voice-room-subtitle', maxLength: 160 } }}
      />
      <Stack sx={{ gap: '8px' }}>
        <Typography sx={{ fontWeight: 800 }}>{i18n._('Keeping the room comfortable')}</Typography>
        <Typography sx={{ opacity: 0.8 }}>
          {i18n._(
            'We want everyone to feel comfortable, so each new person shares a short introduction before they can speak.',
          )}
        </Typography>
        <TextField
          select
          label={i18n._('Who reviews new people')}
          value={draft.reviewMode}
          onChange={(event) => set({ reviewMode: event.target.value as RoomReviewMode })}
          slotProps={{ htmlInput: { 'data-testid': 'voice-room-review-mode' } }}
        >
          <MenuItem value="allMembers">{i18n._('Everyone in the room')}</MenuItem>
          <MenuItem value="alexOnly">{i18n._('Alex only')}</MenuItem>
        </TextField>
      </Stack>
      <Stack sx={{ gap: '6px' }}>
        <Typography sx={{ fontWeight: 700 }}>{i18n._('What a new person should say')}</Typography>
        <RichTextEditor
          value={draft.joinPromptMarkdown}
          onChange={(joinPromptMarkdown) => set({ joinPromptMarkdown })}
          reloadKey="join"
        />
      </Stack>
      <FormControlLabel
        control={
          <Checkbox
            checked={draft.isPublic}
            data-testid="voice-room-public"
            onChange={(_event, checked) => set({ isPublic: checked })}
          />
        }
        label={i18n._('Show this room on the website, so more people can find it')}
      />
      <Stack sx={{ gap: '6px' }}>
        <Typography sx={{ fontWeight: 700 }}>{i18n._('Room rules')}</Typography>
        <RichTextEditor
          value={draft.rulesMarkdown}
          onChange={(rulesMarkdown) => set({ rulesMarkdown })}
          reloadKey="rules"
        />
      </Stack>
      <Stack sx={{ gap: '6px' }}>
        <Typography sx={{ fontWeight: 700 }}>{i18n._('What we usually talk about')}</Typography>
        <RichTextEditor
          value={draft.discussMarkdown}
          onChange={(discussMarkdown) => set({ discussMarkdown })}
          reloadKey="discuss"
        />
      </Stack>
      <Stack sx={{ gap: '8px' }}>
        <Typography sx={{ fontWeight: 700 }}>{i18n._('Room picture')}</Typography>
        <Stack direction="row" sx={{ alignItems: 'center', gap: '6px' }}>
          <IconButton
            aria-label={i18n._('Previous pictures')}
            data-testid="voice-room-pictures-prev"
            onClick={() => scroller.current?.scrollBy({ left: -240, behavior: 'smooth' })}
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          >
            <ChevronLeft />
          </IconButton>
          <Stack
            ref={scroller}
            data-testid="voice-room-pictures"
            direction="row"
            sx={{ gap: '10px', overflowX: 'auto', flex: 1, paddingBottom: '6px' }}
          >
            {draft.previewUrls.map((url) => (
              <Button
                key={url}
                data-testid="voice-room-picture"
                onClick={() => set({ selectedPreviewUrl: url })}
                sx={{
                  minWidth: 160,
                  height: 110,
                  borderRadius: '14px',
                  padding: 0,
                  border:
                    draft.selectedPreviewUrl === url
                      ? '3px solid #7eb6ff'
                      : '3px solid transparent',
                  backgroundImage: `url(${url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ))}
            <Button
              data-testid="voice-room-pictures-more"
              disabled={!canPicture || isCreatingPictures}
              onClick={draft.previewUrls.length === 0 ? onCreatePictures : onShowMore}
              sx={{
                minWidth: 160,
                height: 110,
                borderRadius: '14px',
                textTransform: 'none',
              }}
              variant="outlined"
            >
              {isCreatingPictures
                ? i18n._('Creating pictures...')
                : draft.previewUrls.length === 0
                  ? i18n._('Create pictures')
                  : i18n._('Show more options')}
            </Button>
          </Stack>
          <IconButton
            aria-label={i18n._('Next pictures')}
            data-testid="voice-room-pictures-next"
            onClick={() => scroller.current?.scrollBy({ left: 240, behavior: 'smooth' })}
            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
          >
            <ChevronRight />
          </IconButton>
        </Stack>
      </Stack>
      {error ? (
        <Typography color="error" data-testid="voice-room-form-error">
          {error}
        </Typography>
      ) : null}
      <Button
        data-testid="voice-room-submit"
        variant="contained"
        color="info"
        disabled={isSaving || isCreatingPictures}
        onClick={onSubmit}
        sx={{
          alignSelf: 'flex-start',
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 700,
        }}
      >
        {isSaving ? i18n._('Saving...') : submitLabel}
      </Button>
    </Stack>
  );
};
