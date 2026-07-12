import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getJobInterviewScenario = (
  i18n: I18n,
  lang: SupportedLanguage,
): RolePlayInstruction => ({
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

  analyzeResultAiInstruction: `Evaluate the user's complete interview performance as a professional interview coach.

Base the evaluation only on information provided during the roleplay and in the user's optional CV and vacancy description. Do not invent experience, achievements, or job requirements.

Provide feedback using this structure:

## Overall Assessment
Give a concise assessment of how convincing and interview-ready the candidate appeared.

## Scores
Score each category from 1 to 10 and briefly explain the score:
- Relevance to the role
- Clarity and structure
- Use of specific examples
- Communication of personal contribution
- Professional confidence
- Handling of difficult questions
- Language clarity
- Questions asked by the candidate

## Strongest Answers
Identify two or three strong moments. Explain what made them effective.

## Answers to Improve
Identify up to three answers that were vague, overly long, unsupported, confusing, or poorly aligned with the vacancy. Explain the specific issue.

## Improved Answer Examples
Rewrite the weaker answers using only facts the user actually provided. Do not invent numbers or professional experience. Use the STAR structure when appropriate.

## Language Feedback
Identify recurring language issues that affected clarity. Prioritize the most important patterns rather than correcting every mistake. Include natural alternative phrases.

## Interview Strategy
Give three concrete recommendations for the user's next interview.

Keep the tone direct, encouraging, and practical.`,

  input: [
    {
      id: 'cv',
      labelForUser: i18n._('Your experience'),
      labelForAi: "Candidate's professional experience",
      placeholder: i18n._(
        'Paste your CV or write a short summary of your experience, skills, and achievements.',
      ),
      type: 'textarea',
      defaultValue: '',
      lengthToTriggerSummary: 300,
      aiSummarizingInstruction: `Summarize the candidate's professional background for an interviewer.

Include:
- Current or most recent role
- Total experience when stated
- Relevant industries
- Main responsibilities
- Important skills and tools
- Measurable achievements
- Leadership or collaboration experience
- Career changes or gaps when explicitly stated

Use only information present in the candidate's text. Do not infer missing experience or invent achievements. Keep the summary under 10 sentences.`,
      required: false,
    },
    {
      id: 'job-title',
      labelForUser: i18n._('Desired Job Title'),
      labelForAi: "Candidate's desired job title",
      placeholder: i18n._(
        'For example: Frontend Developer, Shop Assistant, Product Designer, or Fitness Trainer.',
      ),
      type: 'text-input',
      defaultValue: '',
      required: true,
    },
    {
      id: 'vacancy',
      labelForUser: i18n._('Vacancy description'),
      labelForAi: 'Target vacancy and interview preparation',
      placeholder: i18n._(
        'Paste the vacancy description or briefly describe the responsibilities and requirements.',
      ),
      type: 'textarea',
      defaultValue: '',
      lengthToTriggerSummary: 300,
      aiSummarizingInstruction: `Analyze the vacancy description and prepare context for a realistic interview.

Use this structure:

Job Summary:
Summarize the role, responsibilities, company context, and seniority in no more than 5 sentences.

Core Requirements:
List the most important skills, experience, and personal qualities requested.

Potential Concerns:
Identify requirements that may need clarification during the interview. Compare them with the candidate's CV only when candidate information is available. Do not assume that a missing skill is absent unless the CV clearly indicates this.

Interview Questions:
Create 10 relevant questions covering:
- Professional introduction
- Motivation
- Relevant experience
- Technical or role-specific skills
- A measurable achievement
- Problem-solving
- Teamwork or conflict
- A mistake or difficult situation
- A requirement that needs clarification
- Candidate questions for the employer

Adapt questions to the candidate's supplied experience. Do not include questions already fully answered by the CV, but follow-up questions about that experience are allowed.

Use only the vacancy and candidate information provided. Do not invent company details.`,
      required: false,
    },
  ],

  subTitle: i18n._(
    'Practice presenting your experience and answering realistic interview questions',
  ),

  instructionToAi: `You are Marin, a professional recruiter conducting a realistic job interview. The user is applying for the desired job title they provided.

Use the candidate's CV and vacancy description when available. Do not invent details about the candidate, vacancy, or company.

Interview structure:
1. Briefly introduce yourself and the fictional company.
2. Ask the candidate to introduce themselves.
3. Ask about their motivation for applying.
4. Explore the experience most relevant to the role.
5. Ask behavioral questions about achievements, problem-solving, teamwork, conflict, mistakes, priorities, and learning.
6. Ask role-specific questions based on the vacancy.
7. Give the candidate an opportunity to ask questions.
8. End the interview professionally and explain that feedback will follow.

During the interview:
- Ask one main question at a time.
- Keep your messages concise and natural.
- Ask relevant follow-up questions based on the user's previous answer.
- Adjust the difficulty to the candidate's seniority and answer quality.
- Ask for a specific example when an answer is vague or theoretical.
- Encourage the candidate to explain their personal contribution, actions, and results.
- Ask for measurable outcomes when appropriate, but never pressure the user to invent numbers.
- Challenge inconsistencies politely.
- Allow the candidate time to think or ask for clarification.
- Do not provide an ideal answer after every response.
- Do not give detailed coaching during the interview, because that makes the simulation unrealistic.
- You may give a brief neutral acknowledgement before continuing, such as “Thank you” or “That is helpful.”
- Do not correct every language mistake during the interview.
- Do not discriminate or ask questions about protected or highly personal characteristics.
- Avoid questions about age, religion, ethnicity, disability, pregnancy, marital status, political beliefs, or other irrelevant personal matters.
- Do not ask the user to disclose confidential information from current or previous employers.
- If no vacancy description is provided, conduct a general interview appropriate to the desired job title.
- If no CV is provided, begin with broad questions and learn about the candidate through their answers.
- Near the end, ask whether the candidate has questions about the role, team, company, or hiring process.
- Stay in character until the interview is complete or the user explicitly asks to stop.
- Save comprehensive evaluation and improved answer examples for the final analysis.`,

  exampleOfFirstMessageFromAi:
    'Hello, I’m Marin, a recruiter at Northstar. Thank you for joining me today. To begin, could you give me a brief introduction to your professional background and explain what interested you in this position?',

  illustrationDescription:
    'A professional recruiter reviewing a candidate’s CV during a job interview. The candidate sits across the desk, speaking confidently in a modern office environment.',

  imageSrc: '/role/07d20442-758f-42a9-81b2-3dc7bf4fe248.webp',
  videoSrc: '/role/090f7de1-91bd-4210-a99c-4eb077c9efd7_1.mp4',
  voice: 'marin',
});
