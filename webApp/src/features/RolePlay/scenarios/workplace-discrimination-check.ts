import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getWorkplaceDiscriminationCheckScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'workplace-discrimination-check',
  title: i18n._('Workplace Fairness Check'),
  shortTitle: i18n._('Fairness Check'),

  contentPage: i18n._(`This role-play helps you think through difficult situations at work.

If something felt uncomfortable, unfair, or confusing, you can describe what happened.  
The assistant helps you understand whether the behavior may be inappropriate, discriminatory, or simply poor communication.

This is **not legal advice** — it’s a calm, practical way to analyze situations and name what might be happening.

## What you can share

- Conversations with managers or colleagues  
- Hiring, promotion, or performance review situations  
- Comments or jokes that felt uncomfortable  
- Unequal treatment or unclear expectations  
- Situations where you’re unsure if something crossed a line  

## How the analysis works

The assistant will:
- Listen carefully and neutrally  
- Ask clarifying questions if needed  
- Explain relevant workplace norms and boundaries  
- Point out possible red flags or benign explanations  
- Help you separate facts, interpretations, and impact  

The goal is understanding — not blame.

## What this mode is **not**

- Not legal advice  
- Not a verdict or accusation  
- Not encouragement to confront or escalate  

It’s a tool to help you think clearly and calmly.

## Best for

- Understanding workplace boundaries  
- Building language to describe sensitive situations  
- Reflecting before taking action  
- Feeling less alone when something feels “off”  

If something bothered you, it’s worth examining.
`),

  input: [
    {
      type: 'checkbox',
      labelForAi: '',
      labelForUser: i18n._(
        'I aware that this is a simulation and not a real legal consultation.',
      ),
      id: 'aware',
      placeholder: '',
      defaultValue: '',
      required: true,
    },
  ],

  category: {
    categoryTitle: i18n._('Professional'),
    categoryId: 'professional',
  },

  subTitle: i18n._('Understand workplace behavior without judgment or assumptions'),

  useInstructionOnly: true,

  instructionToAi: `
You are a neutral, supportive workplace fairness guide.
Your role is to help the user understand whether a situation at work may involve inappropriate behavior or discrimination.

Guidelines:
- Stay neutral and factual.
- Do not assume intent or guilt.
- Avoid legal advice.
- Explain concepts clearly and calmly.
- Use phrases like "may be considered", "could be interpreted as", or "often depends on context".

Process:
1. Listen carefully to the situation.
2. Ask clarifying questions if important details are missing.
3. Identify:
   - what is objectively observable
   - what is subjective or interpretive
   - what workplace norms typically apply
4. Highlight possible red flags *and* alternative explanations.
5. If relevant, suggest neutral next steps (e.g., documenting, seeking clarification, talking to HR).

Never judge the user.
Never dismiss their feelings.

Start the conversation with:
Hi. You can share any situation that’s been on your mind — especially if it felt off, uncomfortable, or hard to explain.
Take your time. We’ll look at it calmly and try to understand it together.

`,

  exampleOfFirstMessageFromAi: `Hi. You can share any situation that’s been on your mind — especially if it felt off, uncomfortable, or hard to explain.
Take your time. We’ll look at it calmly and try to understand it together.`,

  illustrationDescription:
    'A calm and neutral AI companion helping analyze workplace situations with clarity, fairness, and respect for all sides.',

  imageSrc: '/call/marin/sit.webp',
  voice: 'marin',
});
