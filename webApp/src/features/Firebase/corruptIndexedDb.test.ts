import { createCorruptIndexedDbRecovery, isCorruptIndexedDbError } from './corruptIndexedDb';

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

  it('does not recover again when a previous attempt already flagged the session', async () => {
    const terminateAndClear = jest.fn();
    const reload = jest.fn();
    const recover = createCorruptIndexedDbRecovery({
      terminateAndClear,
      reload,
      getFlag: () => true,
      setFlag: () => undefined,
    });

    await expect(recover(missingFileError)).resolves.toBe(false);
    expect(terminateAndClear).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it('still reloads when clearing persistence fails', async () => {
    const reload = jest.fn();
    const recover = createCorruptIndexedDbRecovery({
      terminateAndClear: jest.fn().mockRejectedValue(new Error('failed-precondition')),
      reload,
      getFlag: () => false,
      setFlag: () => undefined,
    });

    await expect(recover(missingFileError)).resolves.toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
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
