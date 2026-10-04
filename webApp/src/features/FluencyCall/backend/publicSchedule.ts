import { fluencyCallLanguageCode } from '../callLanguage';
import { selectListedCalls } from '../callTime';
import { FluencyCall, FluencyCallStatus } from '../types';

/** Fields a public page may show. Meet links and people are never included. */
export type PublicFluencyCall = {
  id: string;
  startsAtIso: string;
  languageCode: string;
  joinCount: number;
};

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const MAX_CALLS = 20;

export type ScheduleSourceCall = {
  id: string;
  startsAtIso: string;
  status: FluencyCallStatus;
  languageCode?: string | null;
  joinCount: number;
};

export const toPublicFluencyCall = (call: ScheduleSourceCall): PublicFluencyCall | null => {
  if (call.status !== 'scheduled') return null;
  if (!call.id || call.id.length > 128) return null;
  if (!ISO_UTC.test(call.startsAtIso) || Number.isNaN(Date.parse(call.startsAtIso))) return null;
  const joinCount = Number.isFinite(call.joinCount) ? Math.max(0, Math.floor(call.joinCount)) : 0;
  return {
    id: call.id,
    startsAtIso: call.startsAtIso,
    languageCode: fluencyCallLanguageCode(call.languageCode),
    joinCount,
  };
};

export const toPublicSchedule = (calls: ScheduleSourceCall[], now: Date): PublicFluencyCall[] => {
  const listed = selectListedCalls(
    calls.map(
      (call): FluencyCall => ({
        id: call.id,
        startsAtIso: call.startsAtIso,
        link: '',
        status: call.status,
        createdAtIso: '',
        updatedAtIso: '',
        stoppedAtIso: null,
        languageCode: call.languageCode || undefined,
      }),
    ),
    now,
  );
  const byId = new Map(calls.map((call) => [call.id, call]));
  const published: PublicFluencyCall[] = [];
  for (const listedCall of listed) {
    const source = byId.get(listedCall.id);
    const row = source ? toPublicFluencyCall(source) : null;
    if (row) published.push(row);
    if (published.length >= MAX_CALLS) break;
  }
  return published;
};
