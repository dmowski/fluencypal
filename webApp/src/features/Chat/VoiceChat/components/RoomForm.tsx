'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useLingui } from '@lingui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  fullLanguageName,
  SupportedLanguage,
  supportedLanguagesToLearn,
} from '@/features/Lang/lang';
import { RichTextEditor } from '@/features/Chat/RichTextEditor';
import { RoomDraft, RoomListItem, RoomReviewMode } from '../types';
import { RoomCard } from './RoomCard';

const languageChoices = (selected: SupportedLanguage): SupportedLanguage[] => {
  const choices = [...supportedLanguagesToLearn];
  if (!choices.includes(selected)) choices.unshift(selected);
  return choices;
};

const previewItem = (draft: RoomDraft, imageUrl: string): RoomListItem => ({
  room: {
    id: 'preview',
    slug: 'preview',
    title: draft.title.trim() || 'Room name',
    subtitle: draft.subtitle.trim() || 'Short description',
    previewImageUrl: imageUrl,
    reviewMode: draft.reviewMode,
    joinPromptMarkdown: draft.joinPromptMarkdown,
    isPublic: draft.isPublic,
    rulesMarkdown: draft.rulesMarkdown,
    discussMarkdown: draft.discussMarkdown,
    languageCode: draft.languageCode,
    creatorId: '',
    createdAtIso: '',
    updatedAtIso: '',
    memberCount: 1,
    messagesLast7Days: 0,
  },
  unreadCount: 0,
  membershipStatus: null,
  isAdmin: false,
  memberPreviews: [],
});

const Section = ({
  title,
  subtitle,
  titleEnd,
  testId,
  children,
}: {
  title: string;
  subtitle?: string;
  titleEnd?: React.ReactNode;
  testId?: string;
  children: React.ReactNode;
}) => (
  <Stack data-testid={testId} sx={{ gap: '10px' }}>
    <Stack sx={{ gap: '4px' }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: '4px' }}>
        <Typography sx={{ fontWeight: 600, fontSize: '25px' }}>{title}</Typography>
        {titleEnd}
      </Stack>
      {subtitle ? <Typography sx={{ opacity: 0.75 }}>{subtitle}</Typography> : null}
    </Stack>
    <Stack
      sx={{
        padding: '0px 0 0 0',
        gap: '15px',
      }}
    >
      {children}
    </Stack>
  </Stack>
);

export const RoomForm = ({
  draft,
  onChange,
  onCreatePictures,
  onShowMore,
  isCreatingPictures,
  onSubmit,
  title,
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
  title?: string;
  submitLabel: string;
  isSaving: boolean;
  error: string;
}) => {
  const { i18n } = useLingui();
  const scroller = useRef<HTMLDivElement | null>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);
  const set = (patch: Partial<RoomDraft>) => onChange({ ...draft, ...patch });
  const canPicture = draft.title.trim().length >= 2 && draft.subtitle.trim().length >= 2;

  const measureScroll = () => {
    const node = scroller.current;
    if (!node) return;
    setCanScrollBack(node.scrollLeft > 2);
    setCanScrollForward(node.scrollLeft + node.clientWidth < node.scrollWidth - 2);
  };

  useEffect(() => {
    measureScroll();
  }, [draft.previewUrls.length, isCreatingPictures]);

  return (
    <Stack data-testid="voice-room-form" sx={{ width: '100%', maxWidth: 760, gap: '36px' }}>
      {title ? (
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
      ) : null}
      <Section
        title={i18n._('The room')}
        subtitle={i18n._(
          'People see the name, the short description, and the language on the list.',
        )}
      >
        <TextField
          label={i18n._('Room name')}
          value={draft.title}
          onChange={(event) => set({ title: event.target.value })}
          slotProps={{ htmlInput: { 'data-testid': 'voice-room-title', maxLength: 80 } }}
        />
        <TextField
          label={i18n._('Short description')}
          value={draft.subtitle}
          onChange={(event) => set({ subtitle: event.target.value })}
          slotProps={{ htmlInput: { 'data-testid': 'voice-room-subtitle', maxLength: 160 } }}
        />
        <TextField
          select
          label={i18n._('Language')}
          value={draft.languageCode}
          onChange={(event) => set({ languageCode: event.target.value as SupportedLanguage })}
          sx={{ maxWidth: 280 }}
          slotProps={{ htmlInput: { 'data-testid': 'voice-room-language' } }}
        >
          {languageChoices(draft.languageCode).map((code) => (
            <MenuItem key={code} value={code}>
              {fullLanguageName[code]}
            </MenuItem>
          ))}
        </TextField>
      </Section>

      <Section
        title={i18n._('New people')}
        subtitle={i18n._(
          'Each new person records a short introduction before they can leave messages. Choose who listens to that introduction.',
        )}
      >
        <Stack sx={{ gap: '15px', padding: '10px 0 0 0' }}>
          <FormControl data-testid="voice-room-review-mode">
            <FormLabel>{i18n._('Who reviews new people:')}</FormLabel>
            <RadioGroup
              value={draft.reviewMode}
              onChange={(event) => set({ reviewMode: event.target.value as RoomReviewMode })}
            >
              <FormControlLabel
                value="allMembers"
                control={<Radio />}
                label={i18n._('Everyone in the room')}
              />
              <FormControlLabel value="alexOnly" control={<Radio />} label={i18n._('Alex only')} />
            </RadioGroup>
          </FormControl>
          <Stack sx={{ gap: '5px' }}>
            <Typography>{i18n._('What a new person should say:')}</Typography>
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
        </Stack>
      </Section>

      <Section
        title={i18n._('Room rules')}
        subtitle={i18n._('Say how you want people to treat each other in the messages.')}
      >
        <RichTextEditor
          value={draft.rulesMarkdown}
          onChange={(rulesMarkdown) => set({ rulesMarkdown })}
          reloadKey="rules"
        />
      </Section>

      <Section
        title={i18n._('What we usually talk about')}
        subtitle={i18n._('This is what a new person reads before they record an introduction.')}
      >
        <RichTextEditor
          value={draft.discussMarkdown}
          onChange={(discussMarkdown) => set({ discussMarkdown })}
          reloadKey="discuss"
        />
      </Section>

      <Section
        testId="voice-room-preview"
        title={i18n._('Preview')}
        titleEnd={
          <>
            <IconButton
              aria-label={i18n._('Previous pictures')}
              data-testid="voice-room-pictures-prev"
              disabled={!canScrollBack}
              onClick={() => scroller.current?.scrollBy({ left: -280, behavior: 'smooth' })}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              aria-label={i18n._('Next pictures')}
              data-testid="voice-room-pictures-next"
              disabled={!canScrollForward}
              onClick={() => scroller.current?.scrollBy({ left: 280, behavior: 'smooth' })}
            >
              <ChevronRight />
            </IconButton>
          </>
        }
        subtitle={i18n._(
          'Pictures take a few minutes. You can keep writing while they appear. Each option is shown the way it will look on the room list.',
        )}
      >
        <Stack data-testid="voice-room-picture-block" sx={{ gap: '10px' }}>
          <Typography data-testid="voice-room-picture-wait" sx={{ opacity: 0.75 }}>
            {isCreatingPictures
              ? i18n._('Creating pictures. This usually takes a few minutes.')
              : i18n._('Add a name and a short description, then create pictures.')}
          </Typography>
          <Stack
            ref={scroller}
            data-testid="voice-room-pictures"
            direction="row"
            onScroll={measureScroll}
            sx={{ gap: '12px', overflowX: 'auto', padding: '4px 2px 10px' }}
          >
            {draft.previewUrls.map((url) => (
              <Stack
                key={url}
                data-testid="voice-room-picture"
                sx={{
                  minWidth: 280,
                  maxWidth: 320,
                  borderRadius: '20px',
                  outline:
                    draft.selectedPreviewUrl === url
                      ? '3px solid #7eb6ff'
                      : '3px solid transparent',
                }}
              >
                <RoomCard
                  item={previewItem(draft, url)}
                  onOpen={() => set({ selectedPreviewUrl: url })}
                />
              </Stack>
            ))}
            <Button
              data-testid="voice-room-pictures-more"
              disabled={!canPicture || isCreatingPictures}
              onClick={draft.previewUrls.length === 0 ? onCreatePictures : onShowMore}
              sx={{
                minWidth: 220,
                minHeight: 180,
                borderRadius: '18px',
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
        </Stack>
      </Section>

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
          marginTop: '8px',
        }}
      >
        {isSaving ? i18n._('Saving...') : submitLabel}
      </Button>
    </Stack>
  );
};
