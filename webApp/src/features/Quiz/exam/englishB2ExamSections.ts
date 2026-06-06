import { QuizQuestion, QuizSection } from '../types';
import { buildFillGapQuestion, buildMcOptions } from './examQuizBuilders';
import { ENGLISH_B2_EXAM_IMAGES } from './englishB2ExamImages';

const speakingEvaluationInstruction = (imageDescription: string, targetLanguageCode: string) =>
  `Grade the spoken description against what is actually visible in the image.

Ground truth (vision analysis):
${imageDescription}

Accept paraphrasing and minor grammar mistakes when the learner correctly identifies the main subjects, setting, and actions. Mark partial when only some elements are mentioned. Mark incorrect when the description contradicts the image or is unrelated.

Write the learner-facing Feedback in English (${targetLanguageCode}).`;

const buildReadingQuestions = (): QuizQuestion[] => {
  const passages = [
    {
      passageText:
        'Remote work has become common in many industries, but companies still debate how often employees should come to the office. Some managers argue that in-person collaboration builds trust and speeds up decision-making. Others point out that flexible schedules reduce commuting stress and help parents balance family responsibilities. Recent surveys suggest that hybrid models are the most popular compromise.',
      questions: [
        {
          questionText: 'What trend does the passage describe?',
          choices: [
            { label: 'The decline of all office jobs' },
            { label: 'The rise of remote and hybrid work', correct: true },
            { label: 'A ban on working from home' },
            { label: 'Higher salaries for commuters' },
          ],
        },
        {
          questionText: 'According to the passage, what is one advantage of flexible schedules?',
          choices: [
            { label: 'They eliminate the need for managers' },
            { label: 'They reduce commuting stress', correct: true },
            { label: 'They guarantee faster promotions' },
            { label: 'They remove the need for teamwork' },
          ],
        },
      ],
    },
    {
      passageText:
        'Last year, the city council approved a plan to expand cycle lanes along the river. Supporters say the project will cut air pollution and make streets safer for cyclists. Critics worry that removing parking spaces will hurt small shops. Construction is scheduled to begin in April and finish within eighteen months.',
      questions: [
        {
          questionText: 'What is the main purpose of the project?',
          choices: [
            { label: 'To build a new shopping mall' },
            { label: 'To expand cycle lanes along the river', correct: true },
            { label: 'To close the city centre to cars completely' },
            { label: 'To replace buses with boats' },
          ],
        },
        {
          questionText: 'What concern do critics raise?',
          choices: [
            { label: 'The river may flood' },
            { label: 'Less parking may harm small shops', correct: true },
            { label: 'Cyclists dislike river routes' },
            { label: 'The project has no completion date' },
          ],
        },
      ],
    },
    {
      passageText:
        'When Maria moved abroad for university, she struggled at first with academic writing in English. She joined a peer study group, visited the writing centre twice a week, and asked lecturers for feedback on drafts. By the second term, her essays were clearer and her confidence had improved noticeably.',
      questions: [
        {
          questionText: 'What problem did Maria face initially?',
          choices: [
            { label: 'She could not find accommodation' },
            { label: 'She struggled with academic writing in English', correct: true },
            { label: 'She failed every exam' },
            { label: 'She refused to attend lectures' },
          ],
        },
        {
          questionText: 'Which strategy helped Maria improve?',
          choices: [
            { label: 'She stopped submitting drafts' },
            { label: 'She asked lecturers for feedback on drafts', correct: true },
            { label: 'She changed universities immediately' },
            { label: 'She studied only grammar apps' },
          ],
        },
      ],
    },
    {
      passageText:
        'Artificial intelligence tools can summarise long reports in seconds, yet experts warn that users must check facts carefully. Automated summaries may miss nuance or invent details that were not in the original document. For this reason, many newsrooms now require journalists to verify AI-generated content before publication.',
      questions: [
        {
          questionText: 'What benefit of AI tools is mentioned?',
          choices: [
            { label: 'They can summarise long reports quickly', correct: true },
            { label: 'They replace all journalists' },
            { label: 'They never make mistakes' },
            { label: 'They publish articles automatically' },
          ],
        },
        {
          questionText: 'Why do many newsrooms verify AI-generated content?',
          choices: [
            { label: 'Because summaries may be inaccurate or miss nuance', correct: true },
            { label: 'Because AI cannot read documents' },
            { label: 'Because readers dislike technology' },
            { label: 'Because summaries are always too short' },
          ],
        },
      ],
    },
  ];

  const questions: QuizQuestion[] = [];
  let questionIndex = 0;

  for (const passage of passages) {
    for (const item of passage.questions) {
      const questionId = `q-0-${questionIndex}`;
      const { options, correctOptionId } = buildMcOptions(questionId, item.choices);
      questions.push({
        type: 'read-and-answer',
        id: questionId,
        passageText: passage.passageText,
        questionText: item.questionText,
        options,
        correctOptionId,
      });
      questionIndex += 1;
    }
  }

  return questions;
};

const buildListeningQuestions = (): QuizQuestion[] => {
  const items = [
    {
      audioText:
        'The train to Manchester leaves from platform four in twelve minutes. Passengers with heavy luggage should use the lift near the ticket office.',
      questionText: 'Where should passengers with heavy luggage go?',
      choices: [
        { label: 'To platform four immediately' },
        { label: 'To the lift near the ticket office', correct: true },
        { label: 'To the restaurant car' },
        { label: 'To the information desk on platform one' },
      ],
    },
    {
      audioText:
        'Thank you for calling GreenLeaf Insurance. Our office hours are Monday to Friday, nine to five. For urgent claims, press two to speak with an adviser.',
      questionText: 'How can a caller reach an adviser for urgent claims?',
      choices: [
        { label: 'Call again on Saturday morning' },
        { label: 'Press two during the call', correct: true },
        { label: 'Send a letter to the office' },
        { label: 'Visit the office without an appointment' },
      ],
    },
    {
      audioText:
        'Before we begin the meeting, please remember to put your phones on silent and share any conflicts of interest related to the contract.',
      questionText: 'What are participants asked to do before the meeting starts?',
      choices: [
        { label: 'Sign the contract immediately' },
        { label: 'Silence phones and declare conflicts of interest', correct: true },
        { label: 'Leave their laptops in another room' },
        { label: 'Record the discussion on video' },
      ],
    },
    {
      audioText:
        'Due to strong winds, the outdoor concert has been moved to the community hall on King Street. Doors open at six thirty and tickets remain valid.',
      questionText: 'Why was the concert moved?',
      choices: [
        { label: 'The headline band cancelled' },
        { label: 'Strong winds made the outdoor venue unsafe', correct: true },
        { label: 'Tickets sold out too quickly' },
        { label: 'The community hall was cheaper' },
      ],
    },
    {
      audioText:
        'Researchers found that participants who slept seven to eight hours performed better on memory tests than those who slept fewer than six.',
      questionText: 'What did the study suggest about sleep?',
      choices: [
        { label: 'Less than six hours improves memory' },
        { label: 'Seven to eight hours supports better memory performance', correct: true },
        { label: 'Sleep has no effect on memory' },
        { label: 'Only teenagers benefit from longer sleep' },
      ],
    },
    {
      audioText:
        'To return this item, bring the receipt and the product in its original packaging within thirty days. Refunds are issued to the original payment method.',
      questionText: 'What must the customer bring to return an item?',
      choices: [
        { label: 'Only the product box' },
        { label: 'The receipt and original packaging', correct: true },
        { label: 'A handwritten note from the manager' },
        { label: 'A new payment card' },
      ],
    },
    {
      audioText:
        "The museum's new exhibition explores how migration shaped modern cuisine, featuring recipes, photographs, and oral histories from four continents.",
      questionText: 'What is the exhibition mainly about?',
      choices: [
        { label: 'Ancient farming tools' },
        { label: 'How migration influenced modern cuisine', correct: true },
        { label: 'Traditional sports around the world' },
        { label: 'Famous restaurant reviews' },
      ],
    },
    {
      audioText:
        "Although the startup's revenue grew last quarter, rising supply costs meant profits fell by eight percent compared with the previous year.",
      questionText: "What happened to the startup's profits?",
      choices: [
        { label: 'They rose because revenue grew' },
        { label: 'They fell by eight percent despite higher revenue', correct: true },
        { label: 'They stayed exactly the same' },
        { label: 'They doubled in one quarter' },
      ],
    },
  ];

  return items.map((item, index) => {
    const questionId = `q-1-${index}`;
    const { options, correctOptionId } = buildMcOptions(questionId, item.choices);
    return {
      type: 'listening' as const,
      id: questionId,
      audioText: item.audioText,
      questionText: item.questionText,
      options,
      correctOptionId,
    };
  });
};

const buildGrammarQuestions = (): QuizQuestion[] => {
  const items = [
    {
      segments: [
        { kind: 'text' as const, text: 'If the committee ' },
        { kind: 'gap' as const, gapId: 'g1' },
        {
          kind: 'text' as const,
          text: ' the proposal yesterday, we would be preparing the launch today.',
        },
      ],
      gaps: {
        g1: [
          { label: 'approves' },
          { label: 'had approved', correct: true },
          { label: 'will approve' },
          { label: 'is approving' },
        ],
      },
    },
    {
      segments: [
        { kind: 'text' as const, text: 'The report, ' },
        { kind: 'gap' as const, gapId: 'g1' },
        {
          kind: 'text' as const,
          text: ' was published last month, has already influenced local policy.',
        },
      ],
      gaps: {
        g1: [
          { label: 'who' },
          { label: 'which', correct: true },
          { label: 'whose' },
          { label: 'where' },
        ],
      },
    },
    {
      segments: [
        { kind: 'text' as const, text: 'By the time the guests arrived, the chef ' },
        { kind: 'gap' as const, gapId: 'g1' },
        { kind: 'text' as const, text: ' most of the main courses.' },
      ],
      gaps: {
        g1: [
          { label: 'prepares' },
          { label: 'has prepared' },
          { label: 'had prepared', correct: true },
          { label: 'was preparing' },
        ],
      },
    },
    {
      segments: [
        { kind: 'text' as const, text: 'The new software ' },
        { kind: 'gap' as const, gapId: 'g1' },
        { kind: 'text' as const, text: ' by the IT department next Friday.' },
      ],
      gaps: {
        g1: [
          { label: 'installs' },
          { label: 'is installing' },
          { label: 'will be installed', correct: true },
          { label: 'has installed' },
        ],
      },
    },
    {
      segments: [
        { kind: 'text' as const, text: 'She asked me where I ' },
        { kind: 'gap' as const, gapId: 'g1' },
        { kind: 'text' as const, text: ' the missing invoice.' },
      ],
      gaps: {
        g1: [
          { label: 'leave' },
          { label: 'left', correct: true },
          { label: 'had left' },
          { label: 'have left' },
        ],
      },
    },
    {
      segments: [
        { kind: 'text' as const, text: 'Hardly ' },
        { kind: 'gap' as const, gapId: 'g1' },
        { kind: 'text' as const, text: ' the presentation begun when the fire alarm sounded.' },
      ],
      gaps: {
        g1: [
          { label: 'the presentation had' },
          { label: 'had the presentation', correct: true },
          { label: 'did the presentation' },
          { label: 'the presentation has' },
        ],
      },
    },
    {
      segments: [
        { kind: 'text' as const, text: 'I wish I ' },
        { kind: 'gap' as const, gapId: 'g1' },
        { kind: 'text' as const, text: ' more attention during the training session.' },
      ],
      gaps: {
        g1: [
          { label: 'pay' },
          { label: 'paid', correct: true },
          { label: 'would pay' },
          { label: 'have paid' },
        ],
      },
    },
    {
      segments: [
        { kind: 'text' as const, text: 'Neither the manager ' },
        { kind: 'gap' as const, gapId: 'g1' },
        { kind: 'text' as const, text: ' the assistants were available for comment.' },
      ],
      gaps: {
        g1: [{ label: 'or' }, { label: 'nor', correct: true }, { label: 'and' }, { label: 'but' }],
      },
    },
    {
      segments: [
        { kind: 'text' as const, text: 'The project would have succeeded ' },
        { kind: 'gap' as const, gapId: 'g1' },
        { kind: 'text' as const, text: ' better communication between teams.' },
      ],
      gaps: {
        g1: [
          { label: 'with', correct: true },
          { label: 'unless' },
          { label: 'despite' },
          { label: 'without of' },
        ],
      },
    },
    {
      segments: [
        { kind: 'text' as const, text: 'Not only ' },
        { kind: 'gap' as const, gapId: 'g1' },
        {
          kind: 'text' as const,
          text: ' the tickets expensive, but the venue was also difficult to reach.',
        },
      ],
      gaps: {
        g1: [
          { label: 'were' },
          { label: 'was', correct: true },
          { label: 'are' },
          { label: 'had been' },
        ],
      },
    },
  ];

  return items.map((item, index) => {
    const questionId = `q-2-${index}`;
    const { segments, gaps } = buildFillGapQuestion(questionId, item.segments, item.gaps);
    return {
      type: 'fill-gap' as const,
      id: questionId,
      segments,
      gaps,
    };
  });
};

const buildSpeakingQuestions = (): QuizQuestion[] =>
  ENGLISH_B2_EXAM_IMAGES.map((image, index) => {
    const questionId = `q-3-${index}`;
    return {
      type: 'describe-picture-voice' as const,
      id: questionId,
      imageUrl: image.imageUrl,
      imageDescription: image.imageDescription,
      promptText: image.promptText,
      minWords: 35,
      maxWords: 120,
      evaluation: {
        instruction: speakingEvaluationInstruction(image.imageDescription, 'en'),
        maxScore: 1,
      },
    };
  });

export const buildEnglishB2ExamSections = (): QuizSection[] => [
  {
    id: 'section-0-reading',
    title: 'Reading',
    instructions:
      'Read each passage carefully and choose the best answer. You have several reading tasks in this section.',
    questions: buildReadingQuestions(),
  },
  {
    id: 'section-1-listening',
    title: 'Listening',
    instructions:
      'Listen to each audio clip and answer the question. You can replay the audio as many times as you need.',
    questions: buildListeningQuestions(),
  },
  {
    id: 'section-2-grammar',
    title: 'Grammar',
    instructions: 'Complete each sentence by selecting the correct word or phrase for every gap.',
    questions: buildGrammarQuestions(),
  },
  {
    id: 'section-3-speaking',
    title: 'Speaking',
    instructions:
      'Look at each image and record a detailed description in English. Aim for clear, connected sentences.',
    questions: buildSpeakingQuestions(),
  },
];
