import { FieldValue } from 'firebase-admin/firestore';
import { getDB } from '../config/firebase';

type RateLimitResult = {
  ok: boolean;
  retryAfterMs?: number;
  remaining?: number;
  limit: number;
  windowMs: number;
};

const nowMs = () => Date.now();

/**
 * Atomic per-user rate limit using Firestore transaction.
 *
 * Default:
 * - limit 10 per 60s
 * - plus optional cooldown between calls (e.g. 1500ms) to prevent rapid bursts
 */
export async function rateLimitRealtimeInit(opts: {
  userId: string;
  limit?: number;
  windowMs?: number;
  cooldownMs?: number;
}): Promise<RateLimitResult> {
  const { userId } = opts;
  const limit = opts.limit ?? 10;
  const windowMs = opts.windowMs ?? 60_000;
  const cooldownMs = opts.cooldownMs ?? 0;

  const db = getDB();
  const ref = db.collection('rateLimits').doc(`realtimeInit:${userId}`);

  const now = nowMs();
  const windowStart = now - windowMs;

  return await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);

    let count = 0;
    let resetAt = now + windowMs;
    let lastAt = 0;

    if (snap.exists) {
      const d = snap.data() as any;

      // Stored fields
      count = typeof d.count === 'number' ? d.count : 0;
      resetAt = typeof d.resetAt === 'number' ? d.resetAt : now + windowMs;
      lastAt = typeof d.lastAt === 'number' ? d.lastAt : 0;

      // If window expired, reset
      if (resetAt <= now) {
        count = 0;
        resetAt = now + windowMs;
      }
    }

    // Optional cooldown check (anti-burst)
    if (cooldownMs > 0 && lastAt > 0) {
      const sinceLast = now - lastAt;
      if (sinceLast < cooldownMs) {
        return {
          ok: false,
          retryAfterMs: cooldownMs - sinceLast,
          remaining: Math.max(0, limit - count),
          limit,
          windowMs,
        };
      }
    }

    // Limit check
    if (count >= limit) {
      return {
        ok: false,
        retryAfterMs: Math.max(0, resetAt - now),
        remaining: 0,
        limit,
        windowMs,
      };
    }

    // Consume 1 token
    tx.set(
      ref,
      {
        count: count + 1,
        resetAt,
        lastAt: now,
        // optional metadata
        updatedAt: FieldValue.serverTimestamp(),
        // If you enable Firestore TTL, you can set:
        // expiresAt: new Date(resetAt + 5 * 60_000) // keep a bit longer than window
      },
      { merge: true },
    );

    return {
      ok: true,
      remaining: Math.max(0, limit - (count + 1)),
      limit,
      windowMs,
    };
  });
}
