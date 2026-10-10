import { isFluencyCallJoinNoticeSkipped } from './notifyFluencyCallJoin';

describe('fluency call join notice', () => {
  it('skips the founder email', () => {
    expect(isFluencyCallJoinNoticeSkipped('dmowski.alex@gmail.com')).toBe(true);
    expect(isFluencyCallJoinNoticeSkipped('DMOWSKI.ALEX@gmail.com')).toBe(true);
  });

  it('sends for everyone else', () => {
    expect(isFluencyCallJoinNoticeSkipped('learner@example.com')).toBe(false);
    expect(isFluencyCallJoinNoticeSkipped(null)).toBe(false);
    expect(isFluencyCallJoinNoticeSkipped(undefined)).toBe(false);
  });
});
