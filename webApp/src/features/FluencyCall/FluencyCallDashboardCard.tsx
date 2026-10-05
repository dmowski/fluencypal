'use client';

import { useEffect, useState } from 'react';
import { setDoc } from 'firebase/firestore';
import { useLingui } from '@lingui/react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { fullLanguageName, SupportedLanguage } from '@/features/Lang/lang';
import { useSettings } from '@/features/Settings/useSettings';
import { useCurrency } from '@/features/User/useCurrency';
import { sendAnalyticsEvent } from '@/features/Analytics/Custom/sendAnalyticsEvent';
import { FluencyCallApiError, requestFluencyCallCheckout } from './api';
import { fluencyCallLanguageCode } from './callLanguage';
import {
  fluencyCallRowTitle,
  formatCallLabel,
  splitLocalDateTime,
  timeZoneCity,
  viewerTimeZone,
} from './callTime';
import { ensureFluencyCallChat, fluencyCallChatSpaceId } from './fluencyCallChat';
import { setFluencyCallRsvp } from './fluencyCallStore';
import { notifyFluencyCallJoin } from './notifyFluencyCallJoin';
import { FluencyCallCardView } from './FluencyCallCardView';
import { FluencyCallChatModal } from './FluencyCallChatModal';
import { FluencyCallConductModal } from './FluencyCallConductModal';
import { FluencyCallConnectedRow } from './FluencyCallConnectedRow';
import { FluencyCallPaywallModal } from './FluencyCallPaywallModal';
import { FluencyCallRequestModal } from './FluencyCallRequestModal';
import {
  isPendingCallRequest,
  useFluencyCallRequest,
  useListedFluencyCalls,
} from './useFluencyCalls';
import { useFluencyCallAccess } from './useFluencyCallAccess';
import { useNow } from './useNow';
import { useUrlState } from '@/features/Url/useUrlState';

export const FluencyCallDashboardCard = () => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const settings = useSettings();
  const currency = useCurrency();
  const now = useNow(15_000);
  const { calls, loading } = useListedFluencyCalls(now);
  const { request, loading: requestLoading } = useFluencyCallRequest();
  const access = useFluencyCallAccess(now);
  const searchParams = useSearchParams();
  const paymentState = searchParams.get('fluencyCall');
  const practiceUntilCall = searchParams.get('communityCall') === 'ready';
  const cardReady =
    Boolean(auth.uid) && !loading && access.ready && !(calls.length === 0 && requestLoading);

  useEffect(() => {
    if (!practiceUntilCall || !cardReady) return;
    document.getElementById('fluency-call')?.scrollIntoView({ block: 'start' });
  }, [cardReady, practiceUntilCall]);
  const [callChatId, setCallChatId] = useUrlState('callChatId', '', false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [paywallAsked, setPaywallAsked] = useState(paymentState === 'buy');
  const [paywallDismissed, setPaywallDismissed] = useState(false);
  const [buying, setBuying] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingJoinId, setPendingJoinId] = useState<string | null>(null);
  const [conductSaving, setConductSaving] = useState(false);
  const [agreedLocal, setAgreedLocal] = useState(false);
  const [pickedLanguage, setPickedLanguage] = useState<SupportedLanguage | null>(null);

  if (!auth.uid || loading || !access.ready || (calls.length === 0 && requestLoading)) {
    return null;
  }

  const conductAgreed =
    agreedLocal || Boolean(settings.userSettings?.fluencyCallConductAgreedAtIso);
  const paywallOpen = paywallAsked && !paywallDismissed && !access.canJoin;
  const timeZone = viewerTimeZone();
  const targetLanguage = fluencyCallLanguageCode(settings.languageCode);
  const language = pickedLanguage ?? targetLanguage;
  const visibleCalls = calls.filter(
    (call) => fluencyCallLanguageCode(call.languageCode) === language,
  );
  const pendingRequest = isPendingCallRequest(request) ? request : null;
  const requestedSlot = pendingRequest ? splitLocalDateTime(pendingRequest.startsAtIso) : null;
  const requestedLanguage = pendingRequest
    ? fluencyCallLanguageCode(pendingRequest.languageCode)
    : null;
  const requestedClock = pendingRequest
    ? formatCallLabel(pendingRequest.startsAtIso, now, i18n.locale || 'en', timeZone)
    : null;
  const chatCall = calls.find((call) => fluencyCallChatSpaceId(call.id) === callChatId) ?? null;
  const chatLabel = chatCall
    ? formatCallLabel(chatCall.startsAtIso, now, i18n.locale || 'en', timeZone)
    : null;
  const words = {
    today: i18n._('Today'),
    tomorrow: i18n._('Tomorrow'),
    now: i18n._('Now'),
  };
  const requestedLabel =
    requestedClock && requestedLanguage
      ? `${fullLanguageName[requestedLanguage]} · ${fluencyCallRowTitle(requestedClock, false, words)}`
      : null;
  const accessUntilLabel =
    access.passActive && !access.included && access.activeUntilIso
      ? i18n._('Calls included until {date}', {
          date: new Intl.DateTimeFormat(i18n.locale || 'en', {
            timeZone,
            day: 'numeric',
            month: 'short',
          }).format(new Date(access.activeUntilIso)),
        })
      : null;

  const askForAccess = () => {
    setActionError(null);
    setPaywallDismissed(false);
    setPaywallAsked(true);
  };

  const agreeConduct = async () => {
    if (!auth.uid || !pendingJoinId || conductSaving) return;
    const settingsRef = db.documents.userSettings(auth.uid);
    if (!settingsRef) return;
    setConductSaving(true);
    try {
      await setDoc(
        settingsRef,
        { fluencyCallConductAgreedAtIso: new Date().toISOString() },
        { merge: true },
      );
      await setFluencyCallRsvp(pendingJoinId, auth.uid, true);
      const joinedCall = calls.find((item) => item.id === pendingJoinId);
      if (joinedCall) {
        try {
          await notifyFluencyCallJoin(joinedCall, await auth.getToken());
        } catch (error) {
          console.error('Fluency call join notice failed', error);
        }
      }
      setAgreedLocal(true);
      setPendingJoinId(null);
    } finally {
      setConductSaving(false);
    }
  };

  const buy = async () => {
    setBuying(true);
    setActionError(null);
    sendAnalyticsEvent({ name: 'checkout_start', ctaId: 'fluency-call' });
    try {
      const result = await requestFluencyCallCheckout(await auth.getToken(), {
        currency: currency.currency,
        languageCode: settings.languageCode || 'en',
      });
      if (!result.sessionUrl) throw new Error(result.error || 'Checkout did not start');
      window.location.href = result.sessionUrl;
    } catch (checkoutError) {
      const message =
        checkoutError instanceof FluencyCallApiError || checkoutError instanceof Error
          ? checkoutError.message
          : 'Could not start checkout';
      setActionError(message);
      setBuying(false);
    }
  };

  const onShowChat = async (callId: string) => {
    if (!access.canJoin) {
      askForAccess();
      return;
    }
    await ensureFluencyCallChat(auth.uid, callId);
    await setCallChatId(fluencyCallChatSpaceId(callId));
  };

  return (
    <>
      {isRequestOpen ? (
        <FluencyCallRequestModal
          initialDate={requestedSlot?.date}
          initialTime={requestedSlot?.time}
          initialLanguage={requestedLanguage ?? language}
          onClose={() => setIsRequestOpen(false)}
        />
      ) : null}
      {chatCall && chatLabel && access.canJoin ? (
        <FluencyCallChatModal
          callId={chatCall.id}
          startsAtLabel={fluencyCallRowTitle(chatLabel, false, words)}
          onClose={() => {
            void setCallChatId('');
          }}
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
      {paywallOpen ? (
        <FluencyCallPaywallModal
          isRedirecting={buying}
          error={actionError}
          onBuy={() => {
            void buy();
          }}
          onClose={() => setPaywallDismissed(true)}
        />
      ) : null}
      <FluencyCallCardView
        hasCalls={visibleCalls.length > 0}
        canJoin={access.canJoin}
        languageCode={language}
        requestedAtLabel={requestedLabel}
        paidNotice={paymentState === 'paid'}
        practiceNote={
          practiceUntilCall
            ? access.canJoin
              ? i18n._('Talk with AI until the call starts.')
              : i18n._(
                  'Talk with AI until the call. You can pay anytime. You will need the $2 month to join.',
                )
            : null
        }
        accessUntilLabel={accessUntilLabel}
        timeZoneLabel={timeZoneCity(timeZone)}
        onLanguageChange={setPickedLanguage}
        onInitiateCall={() => setIsRequestOpen(true)}
        onGetAccess={askForAccess}
      >
        {visibleCalls.map((call) => (
          <FluencyCallConnectedRow
            key={call.id}
            call={call}
            now={now}
            canJoin={access.canJoin}
            conductAgreed={conductAgreed}
            conductReady={!settings.loading}
            onNeedAccess={askForAccess}
            onNeedConduct={setPendingJoinId}
            onShowChat={(callId) => {
              void onShowChat(callId);
            }}
          />
        ))}
      </FluencyCallCardView>
    </>
  );
};
