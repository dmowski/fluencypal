import { FLUENCY_CALL_COMMUNITY_SPACE_ID } from './fluencyCallChat';

describe('fluency call community chat', () => {
  it('keeps one room that is not tied to a call id', () => {
    expect(FLUENCY_CALL_COMMUNITY_SPACE_ID).toBe('fluencyCall_community');
    expect(FLUENCY_CALL_COMMUNITY_SPACE_ID.split('_')).toEqual(['fluencyCall', 'community']);
  });
});
