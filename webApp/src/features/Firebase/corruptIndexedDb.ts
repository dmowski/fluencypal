import { Firestore, clearIndexedDbPersistence, terminate } from 'firebase/firestore';

const RECOVERY_FLAG = 'fp.firestore.idb.recovery';

let recoveryInFlight = false;

export const getErrorText = (reason: unknown): string => {
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

export type CorruptIndexedDbRecoveryDeps = {
  terminateAndClear: () => Promise<void>;
  reload: () => void;
  getFlag: () => boolean;
  setFlag: () => void;
};

export const createCorruptIndexedDbRecovery = (deps: CorruptIndexedDbRecoveryDeps) => {
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

/** Test-only: reset the in-memory loop guard between cases. */
export const resetCorruptIndexedDbRecoveryForTests = (): void => {
  recoveryInFlight = false;
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

  const recover = createCorruptIndexedDbRecovery({
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

  window.addEventListener('unhandledrejection', (event) => {
    if (!isCorruptIndexedDbError(event.reason)) return;
    event.preventDefault();
    void recover(event.reason);
  });
};
