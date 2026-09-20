import { getQuizTalkInstruction } from './getQuizTalkInstruction';

const voiceInstructions = '## AI Voice\nSpeak slowly.';

describe('getQuizTalkInstruction', () => {
  it('asks a closed yes/no or A/B about a long enough quiz clip', () => {
    const prompt = getQuizTalkInstruction({
      languageName: 'English',
      voice: 'marin',
      aboutUserTranscription: 'I want to speak English at work.',
      voiceInstructions,
    });

    expect(prompt).toContain('I want to speak English at work.');
    expect(prompt).toContain('React to what they said');
    expect(prompt).toContain('ONE closed follow-up');
    expect(prompt).toContain('yes/no, or a two-choice A/B');
    expect(prompt).toContain('Do not ask an open "tell me more"');
    expect(prompt).toContain('Do not lecture, list vocabulary, describe personalities, or ask about their whole day.');
    expect(prompt).toContain('Use English.');
    expect(prompt).toContain('Your name is "marin"');
    expect(prompt).not.toContain('fake A/B choice');
    expect(prompt).not.toContain('Ask the student to describe their day');
    expect(prompt).not.toContain('generateFirstMessageText');
  });

  it('does not invent a choice when the quiz clip is empty', () => {
    const prompt = getQuizTalkInstruction({
      languageName: 'Spanish',
      voice: 'verse',
      aboutUserTranscription: '   ',
      voiceInstructions,
    });

    expect(prompt).toContain('empty or could not be transcribed');
    expect(prompt).toContain('Do not invent a biography or a fake A/B choice');
    expect(prompt).not.toContain('"""');
    expect(prompt).not.toContain('ONE closed follow-up');
    expect(prompt).toContain('Use Spanish.');
  });

  it('does not invent a choice when the quiz clip is under five words', () => {
    const prompt = getQuizTalkInstruction({
      languageName: 'English',
      voice: 'marin',
      aboutUserTranscription: 'I want English',
      voiceInstructions,
    });

    expect(prompt).toContain('I want English');
    expect(prompt).toContain('Do not invent a biography or a fake A/B choice');
    expect(prompt).not.toContain('ONE closed follow-up');
  });
});
