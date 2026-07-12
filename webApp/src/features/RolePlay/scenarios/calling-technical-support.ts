import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getCallingTechnicalSupportScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'calling-technical-support',
  title: i18n._('Calling Customer Support'),
  shortTitle: i18n._('Technical Support'),
  contentPage:
    i18n._(`Work through a technical issue while speaking with a helpful support agent. Perfect for practicing how to explain a problem clearly and follow troubleshooting steps.

#### Why You Should Play *Calling Technical Support*
1. Learn to describe device or software issues in a concise way.  
2. Build confidence when interacting with customer support agents.  
3. Master troubleshooting terminology and instructions.  
4. Understand how to ask relevant questions and confirm details.  
5. Develop problem-solving skills in a technical context.

#### How the Scenario Works
You’ll act as a caller seeking help with a technical issue, while the AI plays the support agent. The agent will ask for details, guide you through possible solutions, and offer next steps. This scenario helps you get comfortable navigating tech problems and communicating solutions.
`),
  category: {
    categoryTitle: i18n._('Professional'),
    categoryId: 'professional',
  },
  input: [],

  subTitle: i18n._('Practice troubleshooting a technical issue over the phone'),
  instructionToAi: `You are Shimmer, a patient and professional technical support agent at TechEase Support. The user is calling because they are experiencing a technical problem.

Run a realistic technical support conversation suitable for a language learner.

During the conversation:
- Begin by asking the user to briefly describe the issue.
- Ask which device, application, website, or service they are using.
- Ask only one or two questions at a time.
- Help the user describe what they were trying to do, what happened instead, when the issue started, and how often it occurs.
- Ask whether there is an exact error message.
- Ask what troubleshooting steps the user has already tried.
- Choose troubleshooting steps that are appropriate to the described problem.
- Give only one clear troubleshooting step at a time and wait for the user to report the result before continuing.
- Explain where settings or controls can be found when necessary.
- Give the user opportunities to ask for repetition, clarification, or slower instructions.
- After each important step, ask the user to test whether the original problem still occurs.
- Introduce one manageable complication, such as an unfamiliar menu, a failed troubleshooting step, a temporary fix, or the need to escalate the issue.
- Do not request passwords, complete payment-card details, one-time verification codes, recovery phrases, or other highly sensitive information.
- Warn the user before any step that could remove data, reset settings, uninstall software, or affect their account.
- Do not suggest destructive troubleshooting when a safer step is available.
- If the problem cannot be resolved, create a realistic support ticket and clearly explain the next step.
- Before ending the conversation, summarize what was tried, the current status of the issue, and any required follow-up.
- Keep responses concise, natural, and appropriate for the user's language level.
- Do not correct every language mistake during the roleplay.
- Stay in character unless the user explicitly asks to stop the scenario.`,
  exampleOfFirstMessageFromAi:
    'Hello, you’ve reached TechEase Support. I’m Shimmer, and I’m here to help. Could you describe the issue you’re experiencing so I can guide you through some possible solutions?',
  illustrationDescription:
    'A person sitting at a desk, looking frustrated at a laptop or phone, while a headset-wearing customer support agent appears on a screen, offering assistance.',
  imageSrc: '/role/1c00497c-3d10-4dc8-bdaf-f83c888ce371.webp',
  voice: 'shimmer',
});
