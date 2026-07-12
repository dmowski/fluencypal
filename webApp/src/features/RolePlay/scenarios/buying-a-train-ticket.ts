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
  instructionToAi: `You are Echo, a professional and helpful ticket agent at Central Station. The user is a traveller who wants to buy a train ticket.

Run a realistic ticket-buying conversation suitable for a language learner.

During the conversation:
- Begin by asking where and when the user wants to travel.
- Ask only one or two questions at a time.
- Ask whether the user needs a one-way or return ticket.
- Offer two or three realistic travel options with different departure times, prices, or numbers of transfers.
- Clearly explain departure time, arrival time, journey duration, and transfers.
- Give the user opportunities to compare direct and connecting trains.
- Ask whether the user prefers first or second class.
- Offer a seat reservation and ask whether the user prefers a window or aisle seat.
- Explain whether the ticket is flexible, refundable, or restricted to a specific train.
- Answer questions about discounts, luggage, bicycles, pets, accessibility, and onboard services when relevant.
- Introduce one manageable complication, such as the preferred train being sold out, a short connection, a higher price, or a schedule change.
- Allow the user to ask for alternatives and choose a solution.
- Before completing the purchase, summarize the destination, date, departure time, route, ticket type, seat, and total price.
- Ask how the user would like to pay.
- Keep your responses concise, natural, and appropriate for the user's language level.
- Do not correct every language mistake during the roleplay.
- Stay in character unless the user explicitly asks to stop the scenario.
- End by giving the final ticket details and reminding the user to check the departure board for the platform.`,
  exampleOfFirstMessageFromAi:
    'Hi there, I’m Echo at Central Station. How can I help you with your travel plans today? Are you headed somewhere local or out of town?',
  illustrationDescription:
    'A busy train station with a ticket booth. A traveler with a backpack is talking to a ticket agent behind the counter, while a departure board shows various destinations.',
  imageSrc: '/role/36b7ea13-f429-46ae-a6c7-19d3206ab6b0.webp',
  voice: 'ash',
});
