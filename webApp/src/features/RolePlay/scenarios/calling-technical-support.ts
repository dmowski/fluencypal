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
  instructionToAi:
    'You are a technical support agent. Ask the user about their issue, guide them through troubleshooting steps, and provide solutions.',
  exampleOfFirstMessageFromAi:
    'Hello, you’ve reached TechEase Support. I’m Shimmer, and I’m here to help. Could you describe the issue you’re experiencing so I can guide you through some possible solutions?',
  illustrationDescription:
    'A person sitting at a desk, looking frustrated at a laptop or phone, while a headset-wearing customer support agent appears on a screen, offering assistance.',
  imageSrc: '/role/1c00497c-3d10-4dc8-bdaf-f83c888ce371.webp',
  voice: 'shimmer',
});
