const inFlightByQuizId = new Map<string, Promise<unknown>>();

export const runOncePerQuizId = <T>(
  quizId: string,
  run: () => Promise<T>,
): Promise<T> => {
  const inFlight = inFlightByQuizId.get(quizId);
  if (inFlight) {
    return inFlight as Promise<T>;
  }

  const promise = run().finally(() => {
    inFlightByQuizId.delete(quizId);
  });
  inFlightByQuizId.set(quizId, promise);
  return promise;
};

export const clearNewsQuizCreateInFlight = (): void => {
  inFlightByQuizId.clear();
};
