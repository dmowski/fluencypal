import { Firestore, clearIndexedDbPersistence, terminate } from 'firebase/firestore';

const RECOVERY_FLAG = 'fp.firestore.idb.recovery';

const getErrorText = (reason: unknown): string => {
  if (typeof reason === 'string') return reason;
  if (reason instanceof Error) return `${reason.name} ${reason.message}`;
  if (reason && typeof reason === 'object') {
    const name = 'name' in reason ? String(reason.name) : '';
    const message = 'message' in reason ? String(reason.message) : '';
    return `${name} ${message}`.trim();
  }
  return '';
};

/**
 * Chrome (especially Android) can evict IndexedDB LevelDB files. Firestore then
 * rejects with this irrecoverable NotReadableError; the client stays broken until
 * persistence is cleared.
 */
export const isCorruptIndexedDbError = (reason: unknown): boolean => {
  return /Data lost due to missing file/i.test(getErrorText(reason));
};

/** Safari/WebKit dropped the IndexedDB process; a reload reconnects it. */
export const isIndexedDbConnectionLostError = (reason: unknown): boolean => {
  return /Connection to Indexed Database server lost/i.test(getErrorText(reason));
};

export type CorruptIndexedDbRecoveryDeps = {
  terminateAndClear: () => Promise<void>;
  reload: () => void;
  getFlag: () => boolean;
  setFlag: () => void;
};

export const createCorruptIndexedDbRecovery = (deps: CorruptIndexedDbRecoveryDeps) => {
  let recoveryInFlight = false;

  return async (reason: unknown): Promise<boolean> => {
    if (!isCorruptIndexedDbError(reason)) return false;
    if (recoveryInFlight || deps.getFlag()) return false;

    recoveryInFlight = true;
    deps.setFlag();

    try {
      await deps.terminateAndClear();
    } catch {
      // Another tab may still hold the lock. Reload anyway so Firestore re-inits.
    }

    deps.reload();
    return true;
  };
};

export type IndexedDbConnectionLostRecoveryDeps = {
  reload: () => void;
  getFlag: () => boolean;
  setFlag: () => void;
};

export const createIndexedDbConnectionLostRecovery = (
  deps: IndexedDbConnectionLostRecoveryDeps,
) => {
  let recoveryInFlight = false;

  return async (reason: unknown): Promise<boolean> => {
    if (!isIndexedDbConnectionLostError(reason)) return false;
    if (recoveryInFlight || deps.getFlag()) return false;

    recoveryInFlight = true;
    deps.setFlag();
    deps.reload();
    return true;
  };
};

const readSessionFlag = (): boolean => {
  try {
    return sessionStorage.getItem(RECOVERY_FLAG) === '1';
  } catch {
    return false;
  }
};

const writeSessionFlag = (): void => {
  try {
    sessionStorage.setItem(RECOVERY_FLAG, '1');
  } catch {
    // Private mode / quota — in-memory guard still prevents a tight loop this page.
  }
};

export const installCorruptFirestorePersistenceRecovery = (firestore: Firestore): void => {
  if (typeof window === 'undefined') return;

  const recoverCorrupt = createCorruptIndexedDbRecovery({
    terminateAndClear: async () => {
      await terminate(firestore);
      await clearIndexedDbPersistence(firestore);
    },
    reload: () => {
      window.location.reload();
    },
    getFlag: readSessionFlag,
    setFlag: writeSessionFlag,
  });

  const recoverConnectionLost = createIndexedDbConnectionLostRecovery({
    reload: () => {
      window.location.reload();
    },
    getFlag: readSessionFlag,
    setFlag: writeSessionFlag,
  });

  window.addEventListener('unhandledrejection', (event) => {
    if (isCorruptIndexedDbError(event.reason)) {
      event.preventDefault();
      void recoverCorrupt(event.reason);
      return;
    }
    if (isIndexedDbConnectionLostError(event.reason)) {
      event.preventDefault();
      void recoverConnectionLost(event.reason);
    }
  });
};
