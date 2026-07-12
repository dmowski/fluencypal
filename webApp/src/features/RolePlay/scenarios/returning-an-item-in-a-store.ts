import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getReturningAnItemInAStoreScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'returning-an-item-in-a-store',
  title: i18n._('Returning an Item to a Store'),
  shortTitle: i18n._('Return'),
  contentPage:
    i18n._(`Handle a return at a customer service desk by describing what went wrong and exploring options for a refund or exchange. Perfect for practicing calm, clear communication in a shopping context.

#### Why You Should Play *Returning an Item in a Store*
1. Understand how to explain an issue or defect politely.  
2. Learn to provide necessary details for a smooth return process.  
3. Practice receiving instructions about refunds or exchanges.  
4. Explore different scenarios, such as missing receipts or store policies.  
5. Build confidence handling a common retail interaction.

#### How the Scenario Works
You’ll step into the role of a customer returning a product, while the AI acts as the store employee. The AI will ask why you’re returning the item and discuss available options. This practical scenario helps you master polite, efficient communication in retail situations.
`),
  category: { categoryTitle: i18n._('Shopping'), categoryId: 'shopping' },
  input: [],

  subTitle: i18n._('Practice explaining product issues and requesting refunds or exchanges'),
  instructionToAi:
    'You are a store employee handling returns. Ask the user why they are returning the item and offer solutions like exchange or refund.',
  exampleOfFirstMessageFromAi:
    'Hi, I’m Sage at the Customer Service desk. I’m sorry to hear you need to return something. Could you tell me what went wrong with the item?',
  illustrationDescription:
    'A customer holding a shopping bag, talking to a cashier at the returns counter, explaining why they need to return an item while the cashier processes the request.',
  imageSrc: '/role/2ac841c8-3569-45e0-a8aa-fe98e15ea5e2.webp',
  voice: 'shimmer',
});
