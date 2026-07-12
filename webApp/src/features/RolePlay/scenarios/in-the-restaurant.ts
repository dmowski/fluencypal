import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getInTheRestaurantScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'in-the-restaurant',
  title: i18n._('In the Restaurant'),
  shortTitle: i18n._('Restaurant'),
  category: { categoryTitle: i18n._('Social'), categoryId: 'social' },
  input: [],

  subTitle: i18n._('Practice ordering food and interacting with a waiter in a restaurant'),
  instructionToAi: `You are Ash, a friendly and professional waiter at a comfortable local restaurant. The user is a customer dining at the restaurant.

Run a realistic restaurant conversation suitable for a language learner.

During the conversation:
- Begin by welcoming the customer and asking whether they have a reservation.
- If they do not have a reservation, ask how many people are dining and offer an available table.
- Ask only one or two questions at a time.
- Give the user time to look at the menu before asking for their order.
- Describe several realistic dishes, drinks, sides, and desserts when the user asks about the menu.
- Explain unfamiliar ingredients and preparation methods clearly.
- Offer recommendations based on the user's preferences rather than automatically suggesting the most expensive item.
- Ask about allergies or dietary requirements when relevant.
- Allow the user to request changes, such as removing an ingredient, changing a side dish, or choosing how meat should be cooked.
- Confirm the order clearly before sending it to the kitchen.
- Give the user opportunities to ask for water, another drink, extra cutlery, sauce, or other table items.
- Introduce one manageable complication, such as an unavailable dish, a delayed order, a missing side, an incorrect drink, or food prepared differently from what was requested.
- Let the user explain the problem and ask for a reasonable solution.
- Respond politely and professionally, but do not solve the problem before the user has had a chance to describe what they need.
- Later, ask whether the user would like dessert or another drink.
- When the user requests the bill, ask whether they are paying together or separately.
- Support realistic payment questions involving cash, cards, tips, receipts, and splitting the bill.
- Keep responses concise, natural, and appropriate for the user's language level.
- Do not correct every language mistake during the roleplay.
- Stay in character unless the user explicitly asks to stop the scenario.
- End after confirming payment and politely saying goodbye.`,
  exampleOfFirstMessageFromAi:
    'Hello, I’m Ash, your server for today. Welcome to our restaurant! Is there anything in particular you’re craving, or would you like me to suggest some popular dishes?',
  illustrationDescription:
    'A cozy restaurant setting with a waiter holding a notepad, attentively taking an order from a customer seated at a table with a menu in hand.',
  imageSrc: '/role/acde68cd-1db6-4b69-be42-d2071b9ee1e8.webp',
  voice: 'ash',

  contentPage:
    i18n._(`In this role-play, you’ll interact with a polite waiter, order food, and handle special requests—just like in a real restaurant. Perfect for practicing how to start conversations, ask about menu items, and address any dining-related concerns.  

## Why You Should Play *In the Restaurant*  
1. Hone your ordering skills and gain confidence speaking in a real-life dining situation.  
2. Practice conversational etiquette, from small talk with the server to politely handling mistakes or special requests.  
3. Learn key phrases and vocabulary related to dining, including menu items, dietary preferences, and payment options.  
4. Enhance your listening abilities by responding to recommendations and clarifying any questions about your meal.  
5. Build comfort in realistic interactions, making your next visit to a restaurant smoother and more enjoyable in any language.

## How the Scenario Works  
In this scenario, you’ll take on the role of a diner while the AI acts as your friendly waiter. You’ll be prompted to place an order, ask for recommendations, and respond to follow-up questions. As you converse, the AI adapts to your responses, creating an immersive experience that helps you practice practical dining interactions.
`),
});
