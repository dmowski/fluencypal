'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '@/features/Auth/useAuth';
import { useGame } from '@/features/Game/useGame';
import { fullEnglishLanguageName, SupportedLanguage } from '@/features/Lang/lang';
import { fluencyCallLanguageCode, fluencyCallLanguageOptions } from './callLanguage';
import { CallDatePicker, CallTimePicker } from './CallDateTimePickers';
import {
  FLUENCY_CALL_LIST_LOOKBACK_MS,
  adminCallTimeZoneOptions,
  formatCallStartLabel,
  fromDatetimeLocalValue,
  getCallCountdown,
  isHttpUrl,
  suggestedCallSlot,
  toDatetimeLocalValue,
  viewerTimeZone,
} from './callTime';
import {
  createFluencyCall,
  deleteFluencyCall,
  setFluencyCallRequestStatus,
  startFluencyCall,
  stopFluencyCall,
  updateFluencyCallSchedule,
} from './fluencyCallStore';
import { FluencyCall, FluencyCallRequest } from './types';
import { useCallJoinerEmails } from './useCallJoinerEmails';
import { useFluencyCallRequests, useFluencyCallRsvps, useFluencyCalls } from './useFluencyCalls';
import { useNow } from './useNow';

export const CallsAdmin = () => {
  const auth = useAuth();
  const game = useGame();
  const now = useNow(15_000);
  const { calls, loading } = useFluencyCalls();
  const { requests, loading: requestsLoading } = useFluencyCallRequests();
  const sortedCalls = [...calls].sort((a, b) => b.startsAtIso.localeCompare(a.startsAtIso));

  const [editingId, setEditingId] = useState<string | null>(null);
  const editingCall = sortedCalls.find((item) => item.id === editingId) ?? null;
  const formKey = editingCall?.id ?? 'new';

  const [draftKey, setDraftKey] = useState<string | null>(null);
  const [startsAtLocal, setStartsAtLocal] = useState('');
  const [link, setLink] = useState('');
  const [languageCode, setLanguageCode] = useState<SupportedLanguage>('en');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [accepting, setAccepting] = useState<FluencyCallRequest | null>(null);
  const [meetLink, setMeetLink] = useState('');
  const [rejecting, setRejecting] = useState<FluencyCallRequest | null>(null);
  const [showOldCalls, setShowOldCalls] = useState(false);
  const [listTimeZone, setListTimeZone] = useState(() => viewerTimeZone());
  const timeZoneOptions = adminCallTimeZoneOptions(viewerTimeZone());

  const serverStartsAt = editingCall ? toDatetimeLocalValue(editingCall.startsAtIso) : '';
  const serverLink = editingCall?.link ?? '';
  const serverLanguage = fluencyCallLanguageCode(editingCall?.languageCode);
  const isDraft = draftKey === formKey;
  const formStartsAt = isDraft ? startsAtLocal : serverStartsAt;
  const formLink = isDraft ? link : serverLink;
  const formLanguage = isDraft ? languageCode : serverLanguage;
  const suggested = suggestedCallSlot(now);
  const activeStartsAt = formStartsAt || `${suggested.date}T${suggested.time}`;
  const [date = suggested.date, time = suggested.time] = activeStartsAt.split('T');
  const previewIso = fromDatetimeLocalValue(activeStartsAt);
  const previewLabel = previewIso ? formatCallStartLabel(previewIso) : '';

  const edit = (next: {
    startsAtLocal?: string;
    link?: string;
    languageCode?: SupportedLanguage;
  }) => {
    setDraftKey(formKey);
    setStartsAtLocal(next.startsAtLocal ?? formStartsAt);
    setLink(next.link ?? formLink);
    setLanguageCode(next.languageCode ?? formLanguage);
    setError('');
  };

  const startEdit = (item: FluencyCall) => {
    setEditingId(item.id);
    setDraftKey(null);
    setError('');
  };

  const startNew = () => {
    setEditingId(null);
    setDraftKey(null);
    setError('');
  };

  const save = async () => {
    if (!auth.uid || isSaving) return;
    const startsAtIso = fromDatetimeLocalValue(activeStartsAt);
    const nextLink = formLink.trim();
    if (!startsAtIso) {
      setError('Set a date and time.');
      return;
    }
    if (!isHttpUrl(nextLink)) {
      setError('Add a link that starts with http:// or https://.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      if (editingCall) {
        await updateFluencyCallSchedule(editingCall, {
          startsAtIso,
          link: nextLink,
          languageCode: formLanguage,
        });
      } else {
        await createFluencyCall({
          userId: auth.uid,
          startsAtIso,
          link: nextLink,
          languageCode: formLanguage,
        });
      }
      setDraftKey(null);
      setEditingId(null);
    } catch (saveError) {
      console.error(saveError);
      setError('Could not save the call.');
    } finally {
      setIsSaving(false);
    }
  };

  const acceptRequest = async () => {
    if (!auth.uid || !accepting || isSaving) return;
    const nextLink = meetLink.trim();
    if (!isHttpUrl(nextLink)) {
      setError('Add a link that starts with http:// or https://.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await createFluencyCall({
        userId: auth.uid,
        startsAtIso: accepting.startsAtIso,
        link: nextLink,
        languageCode: accepting.languageCode,
      });
      await setFluencyCallRequestStatus(accepting.userId, 'accepted');
      setAccepting(null);
      setMeetLink('');
    } catch (acceptError) {
      console.error(acceptError);
      setError('Could not accept the request.');
    } finally {
      setIsSaving(false);
    }
  };

  const rejectRequest = async () => {
    if (!rejecting || isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      await setFluencyCallRequestStatus(rejecting.userId, 'rejected');
      setRejecting(null);
    } catch (rejectError) {
      console.error(rejectError);
      setError('Could not reject the request.');
    } finally {
      setIsSaving(false);
    }
  };

  const start = async (item: FluencyCall) => {
    if (isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      await startFluencyCall(item);
    } catch (startError) {
      console.error(startError);
      setError('Could not start the call.');
    } finally {
      setIsSaving(false);
    }
  };

  const stop = async (item: FluencyCall) => {
    if (isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      await stopFluencyCall(item);
      setDraftKey(null);
    } catch (stopError) {
      console.error(stopError);
      setError('Could not stop the call.');
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (item: FluencyCall) => {
    if (isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      await deleteFluencyCall(item.id);
      if (editingId === item.id) {
        setEditingId(null);
        setDraftKey(null);
      }
    } catch (removeError) {
      console.error(removeError);
      setError('Could not remove the call.');
    } finally {
      setIsSaving(false);
    }
  };

  const sortedRequests = [...requests].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
  const oldCutoff = now.getTime() - FLUENCY_CALL_LIST_LOOKBACK_MS;
  const isOldCall = (item: FluencyCall) => {
    const start = new Date(item.startsAtIso).getTime();
    return Number.isFinite(start) && start < oldCutoff;
  };
  const currentCalls = sortedCalls.filter((item) => !isOldCall(item));
  const oldCalls = sortedCalls.filter(isOldCall);

  const renderCall = (item: FluencyCall) => {
    const itemCountdown = getCallCountdown(item.startsAtIso, now);
    const isLive = Boolean(itemCountdown?.isLive) && item.status === 'scheduled';
    const statusLabel =
      item.status === 'stopped' ? 'Stopped' : isLive ? 'Happening now' : 'Scheduled';
    return (
      <Stack
        key={item.id}
        sx={{
          ...cardSx,
          backgroundColor:
            editingCall?.id === item.id ? 'rgba(47, 128, 237, 0.16)' : cardSx.backgroundColor,
        }}
      >
        <Typography sx={{ fontWeight: 700 }}>
          {formatCallStartLabel(item.startsAtIso, listTimeZone)}
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          {fullEnglishLanguageName[fluencyCallLanguageCode(item.languageCode)]}
        </Typography>
        <Typography sx={{ opacity: 0.8, color: isLive ? '#7DDEAA' : undefined }}>
          {statusLabel}
        </Typography>
        <CallJoiners callId={item.id} />
        {isHttpUrl(item.link) ? (
          <Link href={item.link} target="_blank" rel="noreferrer">
            Join
          </Link>
        ) : null}
        <Stack direction="row" sx={{ gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="outlined" disabled={isSaving} onClick={() => startEdit(item)}>
            Edit
          </Button>
          <Button variant="outlined" disabled={isSaving || isLive} onClick={() => void start(item)}>
            Start
          </Button>
          <Button
            variant="outlined"
            disabled={isSaving || item.status === 'stopped'}
            onClick={() => void stop(item)}
          >
            Stop
          </Button>
          <Button
            variant="outlined"
            color="error"
            disabled={isSaving}
            onClick={() => void remove(item)}
          >
            Remove
          </Button>
        </Stack>
      </Stack>
    );
  };

  return (
    <Stack data-testid="fluency-calls-admin" sx={{ gap: '16px', padding: '10px 20px 40px' }}>
      {error ? (
        <Typography color="error" data-testid="fluency-calls-admin-error">
          {error}
        </Typography>
      ) : null}

      <Stack
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
          gap: '24px',
          alignItems: 'start',
        }}
      >
        <Stack sx={{ gap: '10px' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Requests
          </Typography>
          {requestsLoading ? <Typography>Loading...</Typography> : null}
          {!requestsLoading && sortedRequests.length === 0 ? (
            <Typography sx={{ opacity: 0.8 }}>No requests.</Typography>
          ) : null}
          {sortedRequests.map((request) => {
            const username = game.getUserName(request.userId);
            return (
              <Stack key={request.userId} data-testid="fluency-call-admin-request" sx={cardSx}>
                <Typography>{request.email || 'No email'}</Typography>
                <Link href={`/practice?userId=${request.userId}`} target="_blank" rel="noreferrer">
                  {username}
                </Link>
                <Typography sx={{ opacity: 0.75 }}>
                  Created {formatCallStartLabel(request.createdAtIso)}
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {fullEnglishLanguageName[fluencyCallLanguageCode(request.languageCode)]}
                  {' · '}
                  {formatCallStartLabel(request.startsAtIso)}
                </Typography>
                <Stack direction="row" sx={{ gap: '8px' }}>
                  <Button
                    variant="contained"
                    color="success"
                    disabled={isSaving}
                    onClick={() => {
                      setError('');
                      setMeetLink('');
                      setAccepting(request);
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={isSaving}
                    onClick={() => {
                      setError('');
                      setRejecting(request);
                    }}
                  >
                    Reject
                  </Button>
                </Stack>
              </Stack>
            );
          })}
        </Stack>

        <Stack sx={{ gap: '10px' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            All calls
          </Typography>
          <TextField
            select
            size="small"
            label="Timezone"
            value={listTimeZone}
            onChange={(event) => setListTimeZone(event.target.value)}
            fullWidth
            data-testid="fluency-calls-admin-timezone"
          >
            {timeZoneOptions.map((option) => (
              <MenuItem key={option.timeZone} value={option.timeZone}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {loading ? <Typography>Loading...</Typography> : null}
          {!loading && sortedCalls.length === 0 ? (
            <Typography sx={{ opacity: 0.8 }}>No calls yet.</Typography>
          ) : null}
          {currentCalls.sort((a, b) => a.startsAtIso.localeCompare(b.startsAtIso)).map(renderCall)}
          {oldCalls.length > 0 ? (
            <Button
              variant="text"
              data-testid="fluency-calls-admin-old-toggle"
              onClick={() => setShowOldCalls((open) => !open)}
              sx={{ alignSelf: 'flex-start' }}
            >
              {showOldCalls ? 'Hide old calls' : `Show old calls (${oldCalls.length})`}
            </Button>
          ) : null}
          {showOldCalls ? oldCalls.map(renderCall) : null}
        </Stack>

        <Stack sx={{ gap: '10px' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editingCall ? 'Edit call' : 'New call'}
          </Typography>
          <CallDatePicker
            value={date}
            now={now}
            onChange={(nextDate) => edit({ startsAtLocal: `${nextDate}T${time}` })}
          />
          <CallTimePicker
            date={date}
            time={time}
            now={now}
            minuteStep={1}
            onChange={(nextTime) => edit({ startsAtLocal: `${date}T${nextTime}` })}
          />
          {previewLabel ? <Typography sx={{ fontWeight: 700 }}>{previewLabel}</Typography> : null}
          <TextField
            select
            label="Language"
            value={formLanguage}
            onChange={(event) =>
              edit({ languageCode: fluencyCallLanguageCode(event.target.value) })
            }
            fullWidth
          >
            {fluencyCallLanguageOptions().map((code) => (
              <MenuItem key={code} value={code}>
                {fullEnglishLanguageName[code]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Call link"
            value={formLink}
            placeholder="https://"
            onChange={(event) => edit({ link: event.target.value })}
            fullWidth
          />
          <Stack direction="row" sx={{ gap: '12px', flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => void save()} disabled={isSaving || loading}>
              {isSaving ? 'Saving...' : editingCall ? 'Save changes' : 'Schedule call'}
            </Button>
            {editingCall ? (
              <Button variant="text" onClick={startNew} disabled={isSaving}>
                Cancel
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Stack>

      <Dialog open={Boolean(accepting)} onClose={() => setAccepting(null)} fullWidth maxWidth="xs">
        <DialogTitle>Meet link</DialogTitle>
        <DialogContent>
          <Typography sx={{ marginBottom: '12px' }}>
            {accepting ? formatCallStartLabel(accepting.startsAtIso) : ''}
          </Typography>
          <TextField
            label="Meet link"
            value={meetLink}
            placeholder="https://"
            onChange={(event) => setMeetLink(event.target.value)}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccepting(null)} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void acceptRequest()} disabled={isSaving}>
            Create call
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(rejecting)} onClose={() => setRejecting(null)} fullWidth maxWidth="xs">
        <DialogTitle>Reject this request?</DialogTitle>
        <DialogContent>
          <Typography>
            {rejecting
              ? `${rejecting.email || game.getUserName(rejecting.userId)} · ${formatCallStartLabel(rejecting.startsAtIso)}`
              : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejecting(null)} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => void rejectRequest()}
            disabled={isSaving}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

const CallJoiners = ({ callId }: { callId: string }) => {
  const game = useGame();
  const { rsvps, joinCount } = useFluencyCallRsvps(callId);
  const { emails, status } = useCallJoinerEmails(rsvps.map((rsvp) => rsvp.userId));
  const joiners = [...rsvps].sort((a, b) =>
    game.getUserName(a.userId).localeCompare(game.getUserName(b.userId)),
  );

  return (
    <Stack sx={{ gap: '4px' }}>
      <Typography sx={{ fontWeight: 700 }}>{joinCount} will join</Typography>
      {status === 'error' ? (
        <Typography color="error" sx={{ fontSize: '13px' }}>
          Could not load emails.
        </Typography>
      ) : null}
      {joiners.map((rsvp) => {
        const email = emails[rsvp.userId];
        const emailLabel =
          status === 'ready' ? email || 'No email' : status === 'error' ? 'Email unavailable' : '…';
        return (
          <Typography
            key={rsvp.userId}
            data-testid="fluency-call-admin-joiner"
            sx={{ fontSize: '14px' }}
          >
            {emailLabel}{' '}
            <Link href={`/practice?userId=${rsvp.userId}`} target="_blank">
              {game.getUserName(rsvp.userId)}
            </Link>
          </Typography>
        );
      })}
    </Stack>
  );
};

const cardSx = {
  gap: '8px',
  padding: '14px 16px',
  borderRadius: '12px',
  backgroundColor: 'rgba(255, 255, 255, 0.06)',
};
