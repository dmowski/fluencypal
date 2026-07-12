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
  instructionToAi:
    'You are a polite restaurant waiter. Ask the user for their order, offer recommendations, and respond to any requests.',
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
