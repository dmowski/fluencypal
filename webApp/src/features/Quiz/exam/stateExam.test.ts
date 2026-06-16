import { createInitialQuizProgress } from '../types';
import { aggregateModuleScores, isStateExamPassed } from '../session/quizNavigation';
import {
  buildWritingEvaluationPrompt,
  parseVoiceEvaluationResponse,
} from '../session/scoreQuestion';
import { POLISH_B1_STATE_EXAM_V01 } from './statePolishB1/statePolishB1Exam';
import { countWords } from '../types';

describe('state exam module scoring', () => {
  it('aggregates per-module scores and pass threshold at 50%', () => {
    const progress = createInitialQuizProgress(POLISH_B1_STATE_EXAM_V01.id);
    const listeningSection = POLISH_B1_STATE_EXAM_V01.sections.find(
      (section) => section.moduleId === 'listening',
    );
    const firstListeningQuestion = listeningSection?.questions[0];
    expect(firstListeningQuestion).toBeDefined();

    progress.questionResults[firstListeningQuestion!.id] = {
      questionId: firstListeningQuestion!.id,
      status: 'correct',
      score: 6,
      maxScore: 6,
      evaluatedAtIso: new Date().toISOString(),
    };

    const moduleResults = aggregateModuleScores(POLISH_B1_STATE_EXAM_V01, progress);
    expect(moduleResults).toHaveLength(5);
    expect(moduleResults.map((module) => module.moduleId)).toEqual([
      'listening',
      'reading',
      'grammar',
      'writing',
      'speaking',
    ]);

    const listeningResult = moduleResults.find((module) => module.moduleId === 'listening');
    expect(listeningResult?.score).toBe(6);
    expect(listeningResult?.maxScore).toBe(30);
    expect(listeningResult?.percent).toBe(20);
    expect(listeningResult?.passed).toBe(false);
  });

  it('requires every module to pass for state exam success', () => {
    const allPassed = [
      { moduleId: 'listening' as const, title: 'A', score: 15, maxScore: 30, percent: 50, passed: true },
      { moduleId: 'reading' as const, title: 'B', score: 16, maxScore: 30, percent: 53, passed: true },
      { moduleId: 'grammar' as const, title: 'C', score: 15, maxScore: 30, percent: 50, passed: true },
      { moduleId: 'writing' as const, title: 'D', score: 15, maxScore: 30, percent: 50, passed: true },
      { moduleId: 'speaking' as const, title: 'E', score: 20, maxScore: 40, percent: 50, passed: true },
    ];
    expect(isStateExamPassed(allPassed)).toBe(true);

    const oneFailed = allPassed.map((module, index) =>
      index === 2 ? { ...module, percent: 40, passed: false } : module,
    );
    expect(isStateExamPassed(oneFailed)).toBe(false);
  });
});

describe('writing evaluation helpers', () => {
  it('builds a writing prompt with rubric and word limits', () => {
    const writingQuestion = POLISH_B1_STATE_EXAM_V01.sections
      .flatMap((section) => section.questions)
      .find((question) => question.type === 'writing-text');
    expect(writingQuestion?.type).toBe('writing-text');
    if (writingQuestion?.type !== 'writing-text') return;

    const prompts = buildWritingEvaluationPrompt(
      writingQuestion,
      'To jest przykładowa odpowiedź ucznia.',
      'pl',
    );
    expect(prompts.systemMessage).toContain('Wykonanie zadania');
    expect(prompts.userMessage).toContain(String(writingQuestion.minWords));
  });

  it('parses AI evaluation response into score and feedback', () => {
    const response = `Status: partial
Score: 7.5
Feedback: Dobry pomysł, ale brakuje zakończenia.`;
    const result = parseVoiceEvaluationResponse('q-writing-0', response, 10);
    expect(result.status).toBe('partial');
    expect(result.score).toBe(7.5);
    expect(result.feedback).toContain('Dobry pomysł');
  });
});

describe('countWords', () => {
  it('counts words in Polish text', () => {
    expect(countWords('  Jedno   dwa trzy  ')).toBe(3);
    expect(countWords('')).toBe(0);
  });
});

describe('Polish B1 state exam pilot', () => {
  it('has five modules with official max scores', () => {
    expect(POLISH_B1_STATE_EXAM_V01.source.type).toBe('state-exam');
    expect(POLISH_B1_STATE_EXAM_V01.sections).toHaveLength(5);
    expect(POLISH_B1_STATE_EXAM_V01.sections.map((section) => section.moduleMaxScore)).toEqual([
      30, 30, 30, 30, 40,
    ]);
  });

  it('includes writing and monologue speaking tasks', () => {
    const questionTypes = POLISH_B1_STATE_EXAM_V01.sections.flatMap((section) =>
      section.questions.map((question) => question.type),
    );
    expect(questionTypes).toContain('writing-text');
    expect(questionTypes).toContain('monologue-voice');
    expect(questionTypes).toContain('describe-picture-voice');
  });
});
