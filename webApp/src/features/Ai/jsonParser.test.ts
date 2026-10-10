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

  it('extracts a JSON object that follows a sentence', () => {
    const response = `Which meeting do you want to handle in English?

{ "title": "Follow-up Question" }`;

    expect(extractJsonFromAiResponse(response)).toBe('{ "title": "Follow-up Question" }');
  });

  it('keeps braces that appear inside a JSON string', () => {
    const response = 'Note {draft} then { "title": "Say \\"hello {name}\\" now?" }';
    expect(extractJsonFromAiResponse(response)).toBe('{ "title": "Say \\"hello {name}\\" now?" }');
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

  it('parses a JSON object after a sentence without calling AI fix', async () => {
    const response = `Which meeting do you want to handle in English?

{ "title": "Follow-up Question" }`;
    const generate = jest.fn();

    const parsed = await parseJson<{ title: string }>({
      json: response,
      generate,
      languageCode: 'en',
    });

    expect(parsed).toEqual({ title: 'Follow-up Question' });
    expect(generate).not.toHaveBeenCalled();
  });
});
