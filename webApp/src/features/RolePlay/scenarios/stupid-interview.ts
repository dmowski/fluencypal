import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getStupidInterviewScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'stupid-interview',
  title: i18n._('Stupid Interview Mode'),
  shortTitle: i18n._('Stupid Interview'),

  contentPage:
    i18n._(`This is a role-play interview… with the kind of questions that make you stare at the wall afterward.

The interviewer is confidently wrong, oddly picky, and asks pointless, confusing, or hilariously irrelevant questions — like a real nightmare interview, but safe and fun.

## What this mode is for

- Practicing staying calm under nonsense  
- Training quick answers when questions are unclear  
- Learning to redirect and clarify politely  
- Improving confidence and speaking fluency under pressure  
- Laughing a little (because sometimes that’s the only healthy option)

## How the interview works

The AI plays the interviewer and asks **stupid questions on purpose**:
- vague “tell me about yourself” traps  
- irrelevant hypotheticals  
- contradictory requirements  
- buzzword obsession  
- weird “culture fit” prompts  
- pointless logic puzzles  

You answer like it’s a real interview. The AI continues with more silly questions.

## Ground rules

- Comedy is the point, but the conversation stays respectful.
- No discriminatory or inappropriate questions.
- You can always respond with clarifying questions or redirect back to your strengths.

## Best for

- Interview fluency practice  
- Handling awkward moments  
- Training polite pushback  
- Building confidence in spoken English

Take a breath. It’s going to be stupid.
`),

  input: [],

  category: {
    categoryTitle: i18n._('Professional'),
    categoryId: 'professional',
  },

  subTitle: i18n._('Practice interviews with the most ridiculous questions imaginable'),

  useInstructionOnly: true,

  instructionToAi: `You are role-playing as an interviewer who asks intentionally stupid, irrelevant, or frustrating interview questions.
The goal is to help the user practice staying calm, speaking clearly, and handling nonsense professionally.

Style:
- confident but absurd
- mildly annoying, not abusive
- asks vague or contradictory questions
- occasionally interrupts or changes topic (lightly)

Flow:
- Ask ONE question related to the user experience at a time.
- If the user answers well, respond with an awkward comment and ask an even more stupid follow-up.
- If the user is confused, double down slightly, then allow them to clarify.

Start the conversation with:
"Hi, my name is Verse, I’ll be your interviewer today.
I’ve looked through your profile, and I think we can get started.

So... Tell me about yourself"

After the user responds, continue with more ridiculous questions related to their experience, but make the questions increasingly absurd and irrelevant.

`,

  exampleOfFirstMessageFromAi: `Hi, my name is Verse, I’ll be your interviewer today.
I’ve looked through your profile, and I think we can get started.

So… quick question:
if you were a spreadsheet function, which one would you be — and why?`,

  illustrationDescription:
    'A humorous mock interview scene where a confident interviewer asks bizarre questions, creating a playful but challenging practice environment.',

  imageSrc: '/interview/bg1.webp',
  voice: 'verse',
});
