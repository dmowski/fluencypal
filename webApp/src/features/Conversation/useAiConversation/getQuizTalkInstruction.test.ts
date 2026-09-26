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
    expect(prompt).toContain('Never ask them to say the same sentence again.');
    expect(prompt).not.toContain('they can repeat');
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
    expect(prompt).toContain('Never ask them to say the same sentence again.');
    expect(prompt).not.toContain('they can repeat');
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
    expect(prompt).toContain('Do not hand them a sentence to recite.');
    expect(prompt).toContain('Never ask them to say the same sentence again.');
    expect(prompt).not.toContain('they can repeat');
    expect(prompt).not.toContain('ONE closed follow-up');
  });

  it('teaches the first plan lesson instead of skipping the plan', () => {
    const prompt = getQuizTalkInstruction({
      languageName: 'English',
      voice: 'marin',
      aboutUserTranscription: 'I want to speak English at work.',
      voiceInstructions,
      firstLesson: {
        planTitle: 'Work calls',
        title: 'Clients',
        details: 'Practice a short client call.',
      },
    });

    expect(prompt).toContain('lesson 1 of their plan "Work calls": "Clients"');
    expect(prompt).toContain('Practice a short client call.');
    expect(prompt).toContain('Do not preview later lessons.');
    expect(prompt).not.toContain('Do not say "today we will practice" or open a lesson plan.');
    expect(prompt).toContain('ONE closed follow-up');
  });
});
