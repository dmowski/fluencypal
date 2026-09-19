import { getQuizTalkInstruction } from './getQuizTalkInstruction';

const voiceInstructions = '## AI Voice\nSpeak slowly.';

describe('getQuizTalkInstruction', () => {
  it('reacts to the quiz clip and forbids a new-topic lecture', () => {
    const prompt = getQuizTalkInstruction({
      languageName: 'English',
      voice: 'marin',
      aboutUserTranscription: 'I want to speak English at work.',
      voiceInstructions,
    });

    expect(prompt).toContain('I want to speak English at work.');
    expect(prompt).toContain('React to what they said');
    expect(prompt).toContain('ONE easy follow-up');
    expect(prompt).toContain('Do not lecture, list vocabulary, describe personalities, or ask about their whole day.');
    expect(prompt).toContain('Use English.');
    expect(prompt).toContain('Your name is "marin"');
    expect(prompt).not.toContain('Ask the student to describe their day');
    expect(prompt).not.toContain('generateFirstMessageText');
  });

  it('has a fallback when the quiz clip is empty', () => {
    const prompt = getQuizTalkInstruction({
      languageName: 'Spanish',
      voice: 'verse',
      aboutUserTranscription: '   ',
      voiceInstructions,
    });

    expect(prompt).toContain('empty or could not be transcribed');
    expect(prompt).not.toContain('"""');
    expect(prompt).toContain('Use Spanish.');
  });
});
