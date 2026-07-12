import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getBuyingATrainTicketScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'buying-a-train-ticket',
  title: i18n._('Buying a Train Ticket'),
  shortTitle: i18n._('Ticket'),
  contentPage:
    i18n._(`Get comfortable purchasing travel tickets in a bustling train station scenario. Perfect for practicing how to ask about routes, departure times, and ticket types.

## Why You Should Play *Buying a Train Ticket*
1. Gain confidence asking about schedules, prices, and possible discounts.  
2. Learn essential travel vocabulary, including ticket options and train routes.  
3. Practice navigating public transportation systems in a realistic setting.  
4. Become better at clarifying details and handling unexpected changes.  
5. Build the practical language skills you need for smooth, stress-free travel.

## How the Scenario Works
In this scenario, you’ll step into the role of a traveler looking to buy a ticket. The AI takes on the role of a train station ticket agent, asking you where you’re headed, when you’re departing, and what type of ticket you need. By interacting with the AI, you’ll master the art of asking the right questions and understanding key information about your journey.
`),
  input: [],
  category: { categoryTitle: i18n._('Travel'), categoryId: 'travel' },

  subTitle: i18n._('Practice asking about schedules, fares, and ticket options'),
  instructionToAi:
    'You are a train station ticket agent. Ask the user where they want to go, the departure time, and the type of ticket they need.',
  exampleOfFirstMessageFromAi:
    'Hi there, I’m Echo at Central Station. How can I help you with your travel plans today? Are you headed somewhere local or out of town?',
  illustrationDescription:
    'A busy train station with a ticket booth. A traveler with a backpack is talking to a ticket agent behind the counter, while a departure board shows various destinations.',
  imageSrc: '/role/36b7ea13-f429-46ae-a6c7-19d3206ab6b0.webp',
  voice: 'ash',
});
