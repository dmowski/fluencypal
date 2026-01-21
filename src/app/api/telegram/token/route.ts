import { TelegramAuthRequest, TelegramAuthResponse, TelegramUser } from './types';
import crypto from 'node:crypto';
import { envConfig } from '../../config/envConfig';
import {
  createAuthCustomToken,
  createAuthUser,
  getAuthUser,
  updateAuthUser,
  UserInfo,
} from '../../config/firebase';
import { sentSupportTelegramMessage } from '../sendTelegramMessage';

function parseQueryString(raw: string): Record<string, string> {
  const params = new URLSearchParams(raw);
  const out: Record<string, string> = {};
  // use URLSearchParams to decode and then sort keys deterministically
  params.sort();
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}

function safeJsonParse<T>(s?: string): T | undefined {
  if (!s) return undefined;
  try {
    return JSON.parse(s) as T;
  } catch {
    return undefined;
  }
}

function verifyTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeMs = 10 * 60 * 1000, // 10 minutes; relax during dev if needed
): { ok: true; parsed: Record<string, string> } | { ok: false; reason: string } {
  try {
    const parsed = parseQueryString(initData);

    const providedHash = parsed['hash'];
    if (!providedHash) {
      console.log('Missing hash');
      return { ok: false, reason: 'Missing hash' };
    }

    // Build data-check-string of all k=v except 'hash', sorted by key
    const keys = Object.keys(parsed)
      .filter((k) => k !== 'hash')
      .sort();
    const dataCheckString = keys.map((k) => `${k}=${parsed[k]}`).join('\n');

    // ⚠️ WebApp rule: secret = HMAC_SHA256(bot_token, key = "WebAppData")
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (expectedHash !== providedHash) {
      console.log('Invalid signature:', { expectedHash, providedHash });
      return { ok: false, reason: 'Invalid signature' };
    }

    const authDateStr = parsed['auth_date'];
    if (!authDateStr) {
      console.log('Missing auth_date');
      return { ok: false, reason: 'Missing auth_date' };
    }
    const authDate = Number(authDateStr);
    if (!Number.isFinite(authDate)) {
      console.log('Invalid auth_date:', authDateStr);
      return { ok: false, reason: 'Bad auth_date' };
    }

    const ageMs = Date.now() - authDate * 1000;
    if (ageMs < 0 || ageMs > maxAgeMs) {
      console.log('Expired initData:', { ageMs, maxAgeMs });
      return { ok: false, reason: 'initData expired' };
    }

    return { ok: true, parsed };
  } catch (e) {
    console.log('initData parse/verify error:', e);
    return { ok: false, reason: 'initData parse/verify error' };
  }
}

export async function POST(request: Request) {
  const baseResponse: TelegramAuthResponse = {
    token: '',
    uid: '',
    profile: {
      displayName: null,
      photoURL: null,
      username: null,
      language_code: null,
      is_premium: false,
    },
  };

  try {
    // 1) Read input exactly as requested
    const tgRequest = (await request.json()) as TelegramAuthRequest;
    const initData = tgRequest.initData;

    // 2) Verify Telegram signature
    const botToken = envConfig.telegramBotKey;
    if (!botToken) {
      const resp: TelegramAuthResponse = {
        ...baseResponse,
        error: {
          code: 'SERVER_MISCONFIGURED',
          message: 'Internal error. Try again later.',
        },
      };
      return Response.json(resp);
    }

    const verified = verifyTelegramInitData(initData, botToken);
    if (!verified.ok) {
      const resp: TelegramAuthResponse = {
        ...baseResponse,
        error: {
          code: 'INVALID_INITDATA',
          message: 'Internal error. Try again later..',
          reason: verified.reason,
        },
      };
      return Response.json(resp);
    }

    // 3) Extract Telegram user
    const tgUser = safeJsonParse<TelegramUser>(verified.parsed.user);
    if (!tgUser?.id) {
      const resp: TelegramAuthResponse = {
        ...baseResponse,
        error: {
          code: 'NO_TELEGRAM_USER',
          message: 'Internal error. Try again later...',
        },
      };
      return Response.json(resp);
    }

    const uid = `tg:${tgUser.id}`;
    const displayName =
      [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ').trim() || null;

    // 4) Ensure Firebase user exists (idempotent)
    let userRecord: UserInfo | null = null;
    try {
      userRecord = await getAuthUser(uid);
    } catch (e: any) {
      const notFound =
        e?.errorInfo?.code === 'auth/user-not-found' || /user-not-found/i.test(String(e?.message));
      if (!notFound) {
        const resp: TelegramAuthResponse = {
          ...baseResponse,
          error: {
            code: 'AUTH_LOOKUP_FAILED',
            message: 'Internal error. Try again later....',
          },
        };
        return Response.json(resp);
      }
    }

    if (!userRecord) {
      userRecord = await createAuthUser(uid, {
        displayName,
        photoURL: tgUser.photo_url ?? undefined,
      });

      await sentSupportTelegramMessage({
        message: `New telegram user created: ${displayName} (@${tgUser.username ?? '??'}) - ${tgUser.language_code ?? '??'}`,
        userId: uid,
      });
    }

    // 5) Optional: keep profile fresh
    const maybeUpdates: Partial<UserInfo> = {};
    if (displayName && userRecord.displayName !== displayName) {
      maybeUpdates.displayName = displayName;
    }
    if (tgUser.photo_url && userRecord.photoURL !== tgUser.photo_url) {
      maybeUpdates.photoURL = tgUser.photo_url;
    }
    if (Object.keys(maybeUpdates).length) {
      await updateAuthUser(uid, maybeUpdates);
    }

    // 6) Issue custom token
    const token = await createAuthCustomToken(uid, {
      tgid: tgUser.id,
      tg: { username: tgUser.username ?? null, premium: !!tgUser.is_premium },
      provider: 'telegram',
    });

    const successResponse: TelegramAuthResponse = {
      token,
      uid,
      profile: {
        displayName,
        photoURL: tgUser.photo_url ?? null,
        username: tgUser.username ?? null,
        language_code: tgUser.language_code ?? null,
        is_premium: !!tgUser.is_premium,
      },
    };

    return Response.json(successResponse);
  } catch (err: any) {
    // Fall back to a safe error response (still 200 with error populated)
    const resp: TelegramAuthResponse = {
      ...baseResponse,
      error: {
        code: 'SERVER_ERROR',
        message: 'Unexpected error',
        reason: err?.message ?? 'Unknown',
      },
    };
    return Response.json(resp);
  }
}
