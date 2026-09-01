import {
  createCorruptIndexedDbRecovery,
  isCorruptIndexedDbError,
  resetCorruptIndexedDbRecoveryForTests,
} from './corruptIndexedDb';

describe('isCorruptIndexedDbError', () => {
  it('matches Chrome IndexedDB missing-file DOMExceptions', () => {
    const error = new DOMException(
      'Data lost due to missing file. Affected record should be considered irrecoverable',
      'NotReadableError',
    );
    expect(isCorruptIndexedDbError(error)).toBe(true);
  });

  it('matches Firestore-wrapped Error messages', () => {
    expect(
      isCorruptIndexedDbError(
        new Error(
          'NotReadableError: Data lost due to missing file. Affected record should be considered irrecoverable',
        ),
      ),
    ).toBe(true);
  });

  it('rejects unrelated failures', () => {
    expect(isCorruptIndexedDbError(new Error('Failed to persist write'))).toBe(false);
    expect(isCorruptIndexedDbError(new TypeError('Failed to fetch'))).toBe(false);
    expect(isCorruptIndexedDbError(null)).toBe(false);
  });
});

describe('createCorruptIndexedDbRecovery', () => {
  beforeEach(() => {
    resetCorruptIndexedDbRecoveryForTests();
  });

  const missingFileError = new Error(
    'NotReadableError: Data lost due to missing file. Affected record should be considered irrecoverable',
  );

  it('clears persistence and reloads once', async () => {
    const terminateAndClear = jest.fn().mockResolvedValue(undefined);
    const reload = jest.fn();
    let flagged = false;
    const recover = createCorruptIndexedDbRecovery({
      terminateAndClear,
      reload,
      getFlag: () => flagged,
      setFlag: () => {
        flagged = true;
      },
    });

    await expect(recover(missingFileError)).resolves.toBe(true);
    expect(terminateAndClear).toHaveBeenCalledTimes(1);
    expect(reload).toHaveBeenCalledTimes(1);

    await expect(recover(missingFileError)).resolves.toBe(false);
    expect(terminateAndClear).toHaveBeenCalledTimes(1);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('still reloads when clearing persistence fails', async () => {
    const recover = createCorruptIndexedDbRecovery({
      terminateAndClear: jest.fn().mockRejectedValue(new Error('failed-precondition')),
      reload: jest.fn(),
      getFlag: () => false,
      setFlag: () => undefined,
    });

    const reload = (recover as unknown as { reload?: unknown }).reload;
    void reload;

    const reloadFn = jest.fn();
    const recoverWithReload = createCorruptIndexedDbRecovery({
      terminateAndClear: jest.fn().mockRejectedValue(new Error('failed-precondition')),
      reload: reloadFn,
      getFlag: () => false,
      setFlag: () => undefined,
    });

    await expect(recoverWithReload(missingFileError)).resolves.toBe(true);
    expect(reloadFn).toHaveBeenCalledTimes(1);
  });

  it('ignores unrelated rejections', async () => {
    const terminateAndClear = jest.fn();
    const reload = jest.fn();
    const recover = createCorruptIndexedDbRecovery({
      terminateAndClear,
      reload,
      getFlag: () => false,
      setFlag: () => undefined,
    });

    await expect(recover(new Error('permission-denied'))).resolves.toBe(false);
    expect(terminateAndClear).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });
});
