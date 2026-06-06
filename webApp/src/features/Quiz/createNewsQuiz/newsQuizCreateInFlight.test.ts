import { clearNewsQuizCreateInFlight, runOncePerQuizId } from './newsQuizCreateInFlight';

describe('runOncePerQuizId', () => {
  beforeEach(() => {
    clearNewsQuizCreateInFlight();
  });

  it('runs the factory only once for concurrent calls with the same quizId', async () => {
    let calls = 0;
    const run = async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return `quiz-${calls}`;
    };

    const first = runOncePerQuizId('quiz-1', run);
    const second = runOncePerQuizId('quiz-1', run);

    expect(first).toBe(second);
    await expect(first).resolves.toBe('quiz-1');
    expect(calls).toBe(1);
  });

  it('runs separately for different quizIds', async () => {
    let calls = 0;
    const run = async () => {
      calls += 1;
      return calls;
    };

    await Promise.all([
      runOncePerQuizId('quiz-a', run),
      runOncePerQuizId('quiz-b', run),
    ]);

    expect(calls).toBe(2);
  });

  it('allows a new run after the previous promise settles', async () => {
    let calls = 0;
    const run = async () => {
      calls += 1;
      return calls;
    };

    await runOncePerQuizId('quiz-1', run);
    await runOncePerQuizId('quiz-1', run);

    expect(calls).toBe(2);
  });
});
