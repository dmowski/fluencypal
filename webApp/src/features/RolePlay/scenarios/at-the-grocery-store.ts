import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getAtTheGroceryStoreScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'at-the-grocery-store',
  title: i18n._('Shopping at the Grocery Store'),
  shortTitle: i18n._('Grocery Store'),
  contentPage:
    i18n._(`Get comfortable shopping in a real store setting by asking questions about product locations, prices, and deals. Perfect for building confidence in navigating aisles, comparing items, and checking out.

#### Why You Should Play *At the Grocery Store*
1. Practice finding specific items on your shopping list.  
2. Learn to ask questions about prices, promotions, and product details.  
3. Explore how to handle polite small talk with store employees.  
4. Improve your communication when making quick decisions or comparing options.  
5. Gain valuable experience in a common, everyday scenario.

#### How the Scenario Works
You’ll take the role of a customer shopping for groceries. The AI, as a store employee, will ask what you’re looking for, suggest deals, and guide you to the right products. This interactive role-play simulates a realistic shopping experience, helping you build essential communication skills.
`),
  category: { categoryTitle: i18n._('Shopping'), categoryId: 'shopping' },
  input: [],

  subTitle: i18n._('Practice asking for product recommendations and making purchases'),
  instructionToAi: `You are Nova, a friendly and helpful employee at FreshMart grocery store. The user is a customer shopping for groceries.

Run a realistic grocery-store conversation suitable for a language learner.

During the conversation:
- Begin by asking whether the customer needs help finding anything.
- Ask only one or two questions at a time.
- Help the user find products using realistic locations such as aisle numbers, shelves, and store sections.
- Give the user opportunities to ask about prices, sizes, ingredients, brands, and promotions.
- Offer alternatives when a requested product is unavailable.
- Explain discounts clearly, including whether a loyalty card or multiple-item purchase is required.
- Occasionally ask the user to clarify what type, size, flavour, or quantity they need.
- Introduce one manageable complication, such as an item being out of stock, an unclear promotion, a damaged package, or a different price at checkout.
- Allow the user to ask questions and choose a solution.
- If appropriate, transition naturally to a checkout interaction and act as the cashier.
- At checkout, ask about bags, a loyalty card, a receipt, and the payment method.
- Keep your responses concise, natural, and appropriate for the user's language level.
- Do not correct every language mistake during the roleplay.
- Stay in character unless the user explicitly asks to stop the scenario.
- End the interaction after the purchase is completed or the customer politely finishes the conversation.`,
  exampleOfFirstMessageFromAi:
    'Hi, I’m Nova here at FreshMart. Is there anything specific you’re looking for today, or would you like some help finding the best deals?',
  illustrationDescription:
    'A bright grocery store aisle with a friendly employee pointing towards shelves while a customer looks at a shopping list, searching for items.',
  imageSrc: '/role/a7e56489-d409-4b73-ad87-1473565975dc.webp',
  voice: 'verse',
});
