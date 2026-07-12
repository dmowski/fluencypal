import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getJobInterviewScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'job-interview',
  title: i18n._('Practice Job Interview'),
  shortTitle: i18n._('Job Interview'),

  landingHighlight: i18n._(
    'Step into a realistic interview environment and practice showcasing your professional strengths. This role-play helps you handle common interview questions, discuss your experience, and demonstrate why you’re the right candidate.',
  ),

  contentPage:
    i18n._(`Step into a realistic interview environment and practice showcasing your professional strengths. This role-play helps you handle common interview questions, discuss your experience, and demonstrate why you’re the right candidate.

## Why You Should Play *Job Interview*  
1. Master the art of professional communication, from introducing yourself to highlighting key skills.  
2. Gain confidence navigating tricky interview questions and providing thoughtful, structured answers.  
3. Learn how to present your achievements clearly, whether you have extensive experience or are just starting out.  
4. Receive real-time feedback on tone, clarity, and overall presentation to refine your interview style.  
5. Develop the poise and readiness you need for any real-life interview scenario.

## How the Scenario Works  
In this scenario, you’ll take on the role of a job candidate while our AI acts as a professional recruiter. You’ll be asked about your experience, skills, and motivations for the role, with the AI adjusting difficulty based on your responses. Use the prompts to practice delivering concise, persuasive answers that help you stand out in any job interview.
`),
  category: {
    categoryTitle: i18n._('Professional'),
    categoryId: 'professional',
  },
  analyzeResultAiInstruction: `Analyze the user's responses and provide constructive feedback on their interview performance. Highlight areas of strength and suggest improvements for future interviews.`,
  input: [
    {
      id: 'cv',
      labelForUser: i18n._(`Your experience`),
      labelForAi: "User's CV text",
      placeholder: i18n._(
        `Paste your CV text here. You can also write a brief summary of your experience.`,
      ),
      type: 'textarea',
      defaultValue: '',
      lengthToTriggerSummary: 300,
      aiSummarizingInstruction:
        "Summarize the user's experience and skills. Return text no longer than 10 sentences.",
      required: false,
    },
    {
      id: 'job-title',
      labelForUser: i18n._(`Desired Job Title`),
      labelForAi: "User's desired Job Title",
      placeholder: i18n._(
        `Your desired job title. Like Designer, Shop-Assistant, Fitness Trainer, etc.`,
      ),
      type: 'text-input',
      defaultValue: '',
      required: true,
    },
    {
      id: 'vacancy',
      labelForUser: i18n._(`Vacancy description`),
      labelForAi: 'Desired Job Vacancy Description',
      placeholder: i18n._(
        `Paste vacancy description if you have it. You can also write a brief summary of the job requirements.`,
      ),
      type: 'textarea',
      defaultValue: '',

      lengthToTriggerSummary: 10,
      requiredFieldsToSummary: ['cv'],
      aiSummarizingInstruction: `Summarize the vacancy description. Return vacancy description within 5 sentences.
And create list of 10 questions to candidate based on vacancy and use candidate's CV to make questions more candidate oriented (mention info from CV if applicable).

Response structure:
Job Description: [Vacancy description]
Questions to Candidate: [List of 10 questions]

------

Candidate's info below, don't include questions that are already answered by candidate in their CV.
`,
      required: false,
    },
  ],

  subTitle: i18n._('Master answering common interview questions with AI'),
  instructionToAi: `You are a professional recruiter conducting a job interview.
Ask the user about their experience, skills, and why they want the job.
Adjust difficulty based on responses.
Leave feedback after each user message, as well as examples of best responses, taking into account the user's resume.
Keep asking user different aspects of the job.
`,
  exampleOfFirstMessageFromAi:
    "Hi, my name is Alloy. I'm a recruiter at XYZ. Thank you for coming in today. I’d love to learn more about your professional background and experiences. Could you start by telling me a bit about yourself?",
  illustrationDescription:
    "A professional recruiter sitting at a desk, reviewing a candidate's resume, while the candidate sits across, looking slightly nervous but engaged in conversation.",
  imageSrc: '/role/07d20442-758f-42a9-81b2-3dc7bf4fe248.webp',
  videoSrc: '/role/090f7de1-91bd-4210-a99c-4eb077c9efd7_1.mp4',
  voice: 'marin',
});
