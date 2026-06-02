import type { ClientMessage } from '../protocol/messages.js';

const USER_ACTIVITY_MESSAGE_TYPES = new Set<ClientMessage['type']>([
  'session.update',
  'user.text',
  'user.turn.commit',
  'user.turn.cancel',
  'assistant.trigger',
  'assistant.instruction',
  'vision.frame',
]);

/** Returns true when the frame should reset the session idle timer (not keepalive pings). */
export const isUserActivityMessage = (message: ClientMessage): boolean =>
  USER_ACTIVITY_MESSAGE_TYPES.has(message.type);

export type SessionIdleGuard = {
  onUserActivity: () => void;
  dispose: () => void;
};

export const createSessionIdleGuard = ({
  timeoutMs,
  onIdle,
}: {
  timeoutMs: number;
  onIdle: () => void;
}): SessionIdleGuard => {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const schedule = (): void => {
    if (timeoutMs <= 0) {
      return;
    }

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = null;
      onIdle();
    }, timeoutMs);
  };

  return {
    onUserActivity: schedule,
    dispose: () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
};
