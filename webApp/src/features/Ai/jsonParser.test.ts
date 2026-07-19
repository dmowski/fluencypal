import { extractJsonFromAiResponse, parseJson } from './jsonParser';

describe('extractJsonFromAiResponse', () => {
  it('extracts JSON from a fenced block when extra markdown follows', () => {
    const response = `\`\`\`json
{
  "progress": 70,
  "isFollowingPlan": true,
  "suggestionsToTeacher": "",
  "teacherResponse": ""
}
\`\`\`

**Analysis:**

The teacher is effectively guiding the student through Step 1 of the lesson plan.`;

    expect(extractJsonFromAiResponse(response)).toBe(`{
  "progress": 70,
  "isFollowingPlan": true,
  "suggestionsToTeacher": "",
  "teacherResponse": ""
}`);
  });

  it('returns plain JSON unchanged', () => {
    const response = '{"progress": 70}';
    expect(extractJsonFromAiResponse(response)).toBe(response);
  });
});

describe('parseJson', () => {
  it('parses fenced JSON with trailing analysis without calling AI fix', async () => {
    const response = `\`\`\`json
{
  "progress": 70,
  "isFollowingPlan": true,
  "suggestionsToTeacher": "",
  "teacherResponse": ""
}
\`\`\`

**Analysis:** extra markdown should be ignored`;

    const generate = jest.fn();

    const parsed = await parseJson<{ progress: number; isFollowingPlan: boolean }>({
      json: response,
      generate,
      languageCode: 'en',
    });

    expect(parsed).toEqual({
      progress: 70,
      isFollowingPlan: true,
      suggestionsToTeacher: '',
      teacherResponse: '',
    });
    expect(generate).not.toHaveBeenCalled();
  });
});
