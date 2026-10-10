'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { setDoc } from 'firebase/firestore';
import { useLingui } from '@lingui/react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { defaultAvatar } from '@/features/Game/avatars';
import { useGame } from '@/features/Game/useGame';
import { fullLanguageName, SupportedLanguage } from '@/features/Lang/lang';
import { useSettings } from '@/features/Settings/useSettings';
import { ChatProvider, useChat } from '@/features/Chat/useChat';
import { useUrlState } from '@/features/Url/useUrlState';
import { fluencyCallLanguageCode } from './callLanguage';
import {
  fluencyCallRowTitle,
  formatCallDateLine,
  formatCallLabel,
  selectFeaturedCall,
  selectListedCalls,
  selectPersistentMeetLink,
  splitLocalDateTime,
  timeZoneCity,
  viewerTimeZone,
} from './callTime';
import { ensureFluencyCallCommunityChat, FLUENCY_CALL_COMMUNITY_SPACE_ID } from './fluencyCallChat';
import { setFluencyCallRsvp } from './fluencyCallStore';
import { notifyFluencyCallJoin } from './notifyFluencyCallJoin';
import {
  FLUENCY_CALL_WELCOME_VIDEO_SRC,
  FluencyCallCardCall,
  FluencyCallCardView,
} from './FluencyCallCardView';
import { FluencyCallConductModal } from './FluencyCallConductModal';
import { FluencyCallParticipants } from './FluencyCallParticipants';
import { FluencyCallRequestModal } from './FluencyCallRequestModal';
import {
  isPendingCallRequest,
  useFluencyCallRequest,
  useFluencyCallRsvps,
  useFluencyCalls,
} from './useFluencyCalls';
import { useFluencyCallAccess } from './useFluencyCallAccess';
import { useNow } from './useNow';
import { FluencyCall } from './types';

const communityChatMetadata = {
  spaceId: FLUENCY_CALL_COMMUNITY_SPACE_ID,
  allowedUserIds: null,
  isPrivate: false as const,
  type: 'fluencyCall' as const,
};

export const FluencyCallDashboardCard = () => {
  const auth = useAuth();
  const now = useNow(15_000);
  const { calls, loading } = useFluencyCalls();
  const { request, loading: requestLoading } = useFluencyCallRequest();
  const access = useFluencyCallAccess();
  const searchParams = useSearchParams();
  const [callChatId] = useUrlState('callChatId', '', false);
  const listed = selectListedCalls(calls, now);

  if (
    !auth.uid ||
    loading ||
    !access.ready ||
    !access.canJoin ||
    (listed.length === 0 && requestLoading)
  ) {
    return null;
  }

  return (
    <ChatProvider metadata={communityChatMetadata}>
      <FluencyCallDashboardBody
        now={now}
        calls={calls}
        request={request}
        paidNotice={searchParams.get('fluencyCall') === 'paid'}
        initialChatExpanded={Boolean(callChatId)}
      />
    </ChatProvider>
  );
};

const FluencyCallDashboardBody = ({
  now,
  calls,
  request,
  paidNotice,
  initialChatExpanded,
}: {
  now: Date;
  calls: FluencyCall[];
  request: ReturnType<typeof useFluencyCallRequest>['request'];
  paidNotice: boolean;
  initialChatExpanded: boolean;
}) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const settings = useSettings();
  const chat = useChat();
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [pendingJoinId, setPendingJoinId] = useState<string | null>(null);
  const [conductSaving, setConductSaving] = useState(false);
  const [agreedLocal, setAgreedLocal] = useState(false);
  const [pickedLanguage, setPickedLanguage] = useState<SupportedLanguage | null>(null);
  const [notice, setNotice] = useState('');
  const [rsvpById, setRsvpById] = useState<
    Record<string, { joinCount: number; isJoining: boolean }>
  >({});

  useEffect(() => {
    if (!auth.uid) return;
    void ensureFluencyCallCommunityChat(auth.uid);
  }, [auth.uid]);

  const onRsvp = useCallback(
    (callId: string, facts: { joinCount: number; isJoining: boolean } | null) => {
      setRsvpById((prev) => {
        if (!facts) {
          if (!(callId in prev)) return prev;
          const next = { ...prev };
          delete next[callId];
          return next;
        }
        const current = prev[callId];
        if (
          current &&
          current.joinCount === facts.joinCount &&
          current.isJoining === facts.isJoining
        ) {
          return prev;
        }
        return { ...prev, [callId]: facts };
      });
    },
    [],
  );

  const conductAgreed =
    agreedLocal || Boolean(settings.userSettings?.fluencyCallConductAgreedAtIso);
  const timeZone = viewerTimeZone();
  const locale = i18n.locale || 'en';
  const targetLanguage = fluencyCallLanguageCode(settings.languageCode);
  const language = pickedLanguage ?? targetLanguage;
  const visibleListed = selectListedCalls(
    calls.filter((call) => fluencyCallLanguageCode(call.languageCode) === language),
    now,
  );
  const featuredCall = selectFeaturedCall(visibleListed, now);
  const schedule = featuredCall
    ? [featuredCall, ...visibleListed.filter((call) => call.id !== featuredCall.id)]
    : [];

  const words = {
    today: i18n._('Today'),
    tomorrow: i18n._('Tomorrow'),
    now: i18n._('Now'),
  };

  const cardCalls: FluencyCallCardCall[] = [];

  for (const call of schedule) {
    const label = formatCallLabel(call.startsAtIso, now, locale, timeZone);
    if (!label) continue;
    const isLive = new Date(call.startsAtIso).getTime() <= now.getTime();
    const facts = rsvpById[call.id];
    cardCalls.push({
      id: call.id,
      title: fluencyCallRowTitle(label, isLive, words),
      dateLabel: formatCallDateLine(call.startsAtIso, locale, timeZone) ?? '',
      participantCount: facts?.joinCount ?? 0,
      isJoining: facts?.isJoining ?? false,
      isLive,
    });
  }

  const pendingRequest = isPendingCallRequest(request) ? request : null;
  const requestedSlot = pendingRequest ? splitLocalDateTime(pendingRequest.startsAtIso) : null;
  const requestedLanguage = pendingRequest
    ? fluencyCallLanguageCode(pendingRequest.languageCode)
    : null;
  const requestedClock = pendingRequest
    ? formatCallLabel(pendingRequest.startsAtIso, now, locale, timeZone)
    : null;
  const requestedLabel =
    requestedClock && requestedLanguage
      ? `${fullLanguageName[requestedLanguage]} · ${fluencyCallRowTitle(requestedClock, false, words)}`
      : null;

  const commitJoin = async (callId: string, joining: boolean) => {
    if (!auth.uid) return;
    await setFluencyCallRsvp(callId, auth.uid, joining);
    if (!joining) return;
    const joinedCall = calls.find((item) => item.id === callId);
    if (!joinedCall) return;
    try {
      await notifyFluencyCallJoin(joinedCall, await auth.getToken(), auth.userInfo?.email);
    } catch (error) {
      console.error('Fluency call join notice failed', error);
    }
  };

  const agreeConduct = async () => {
    if (!auth.uid || !pendingJoinId || conductSaving) return;
    const settingsRef = db.documents.userSettings(auth.uid);
    if (!settingsRef) return;
    setConductSaving(true);
    setNotice('');
    try {
      await setDoc(
        settingsRef,
        { fluencyCallConductAgreedAtIso: new Date().toISOString() },
        { merge: true },
      );
      await commitJoin(pendingJoinId, true);
      setAgreedLocal(true);
      setPendingJoinId(null);
    } catch (error) {
      console.error(error);
      setNotice(i18n._('Could not update your plans. Please try again.'));
    } finally {
      setConductSaving(false);
    }
  };

  const onToggleJoining = async (callId: string, joining: boolean) => {
    if (!auth.uid) return;
    setNotice('');
    if (joining && !settings.loading && !conductAgreed) {
      setPendingJoinId(callId);
      return;
    }
    if (joining && settings.loading) return;
    await commitJoin(callId, joining);
  };

  const messages = [...chat.topLevelMessages]
    .filter(
      (message) =>
        !message.isDeleted &&
        (message.content.trim().length > 0 || (message.attachments?.length ?? 0) > 0),
    )
    .sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso));

  return (
    <>
      {schedule.map((call) => (
        <FluencyCallRsvpReporter key={call.id} callId={call.id} onChange={onRsvp} />
      ))}
      {isRequestOpen ? (
        <FluencyCallRequestModal
          initialDate={requestedSlot?.date}
          initialTime={requestedSlot?.time}
          initialLanguage={requestedLanguage ?? language}
          onClose={() => setIsRequestOpen(false)}
        />
      ) : null}
      {pendingJoinId ? (
        <FluencyCallConductModal
          isSaving={conductSaving}
          onAgree={() => {
            void agreeConduct();
          }}
          onClose={() => {
            if (!conductSaving) setPendingJoinId(null);
          }}
        />
      ) : null}
      <FluencyCallCardView
        calls={cardCalls}
        languageCode={language}
        onLanguageChange={setPickedLanguage}
        timeZoneLabel={timeZoneCity(timeZone)}
        meetUrl={selectPersistentMeetLink(calls, language, featuredCall)}
        messages={messages}
        onToggleJoining={onToggleJoining}
        onSendMessage={async (text) => {
          await chat.addMessage({
            messageContent: text,
            parentMessageId: '',
            attachments: [],
          });
        }}
        canJoin
        requestedAtLabel={requestedLabel}
        paidNotice={paidNotice}
        onInitiateCall={() => setIsRequestOpen(true)}
        initialChatExpanded={initialChatExpanded}
        notice={notice}
        callPeople={(call) => <FluencyCallPeople callId={call.id} callTitle={call.title} />}
        welcomeVideoSrc={FLUENCY_CALL_WELCOME_VIDEO_SRC}
      />
    </>
  );
};

const FluencyCallRsvpReporter = ({
  callId,
  onChange,
}: {
  callId: string;
  onChange: (callId: string, facts: { joinCount: number; isJoining: boolean } | null) => void;
}) => {
  const { joinCount, isJoining } = useFluencyCallRsvps(callId);

  useEffect(() => {
    onChange(callId, { joinCount, isJoining });
    return () => onChange(callId, null);
  }, [callId, joinCount, isJoining, onChange]);

  return null;
};

const FluencyCallPeople = ({ callId, callTitle }: { callId: string; callTitle: string }) => {
  const { i18n } = useLingui();
  const game = useGame();
  const { rsvps, loading } = useFluencyCallRsvps(callId);
  const [open, setOpen] = useState(false);
  const participants = rsvps.map((rsvp) => ({
    userId: rsvp.userId,
    userName: game.getUserName(rsvp.userId),
    avatarUrl: game.gameAvatars?.[rsvp.userId] || defaultAvatar,
  }));

  return (
    <>
      <Button
        data-testid={`fluency-call-people-${callId}`}
        color="inherit"
        onClick={() => setOpen((value) => !value)}
        sx={{
          justifyContent: 'flex-start',
          padding: '4px 0',
          minWidth: 0,
          color: '#EDF0F8',
          textTransform: 'none',
          fontWeight: 600,
          textAlign: 'left',
        }}
      >
        {open ? i18n._('Hide names') : `${i18n._("Who's joining")} · ${callTitle}`}
      </Button>
      {open ? (
        <FluencyCallParticipants
          participants={participants}
          loading={loading}
          onOpenParticipant={(userId) => game.showUserInModal(userId)}
        />
      ) : null}
    </>
  );
};
