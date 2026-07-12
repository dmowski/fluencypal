import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getAtTheGroceryStoreScenario = (
  i18n: I18n,
  lang: SupportedLanguage,
): RolePlayInstruction => ({
  id: 'at-the-grocery-store',
  title: i18n._('Shopping at the Grocery Store'),
  shortTitle: i18n._('Grocery Store'),
  landingHighlight: i18n._(
    'Practice finding products, comparing prices, asking about ingredients, and paying for your groceries in a realistic store conversation.',
  ),
  contentPage:
    i18n._(`Shopping at a grocery store involves many short but useful conversations. You may need to find a product, ask about a price, understand a promotion, check ingredients, or speak with a cashier.

You do not need long or complicated sentences. Clear questions and polite phrases are usually enough.

## How to Ask Where Something Is

When you cannot find a product, you can approach an employee and say:

- “Excuse me, could you help me?”
- “Where can I find the milk?”
- “Which aisle is the pasta in?”
- “Do you know where the rice is?”
- “I’m looking for olive oil.”
- “Could you show me where it is?”

An employee may respond with directions such as:

- “It’s in aisle five.”
- “It’s next to the bread.”
- “You’ll find it at the back of the store.”
- “It’s on the top shelf.”
- “It’s in the refrigerated section.”
- “Follow me. I’ll show you.”

Useful location words include:

- **Aisle** — a passage between shelves
- **Shelf** — the surface where products are displayed
- **Checkout** — the place where you pay
- **Refrigerated section** — the area for chilled products
- **Frozen-food section** — the area containing frozen products
- **Produce section** — the area containing fruit and vegetables
- **Bakery section** — the area containing bread and baked goods

## Ask Whether a Product Is Available

Sometimes a shelf is empty or the product you need is difficult to find.

You can ask:

- “Do you have this product?”
- “Do you sell oat milk?”
- “Is this item still available?”
- “Do you have any more in stock?”
- “When will this be available again?”
- “Is there another brand you would recommend?”
- “Do you have a similar product?”

If the product is unavailable, an employee may say:

- “I’m afraid it’s out of stock.”
- “We should have more tomorrow.”
- “That product has been discontinued.”
- “We have a similar one from another brand.”
- “Let me check in the storage room.”

## Ask About Prices

Price labels can sometimes be unclear, especially when several products are displayed together.

Useful questions include:

- “How much is this?”
- “Could you check the price for me?”
- “Is this the correct price?”
- “Is the price per item or per kilogram?”
- “Does this include tax?”
- “Why is the price different at the checkout?”
- “Which one is cheaper?”

You may also hear:

- “It costs three ninety-nine.”
- “It’s sold by weight.”
- “The price is per kilogram.”
- “The discount is applied at the checkout.”
- “You need a loyalty card to get that price.”

## Understand Promotions and Discounts

Stores often use promotional language that may be confusing.

Common offers include:

- **Buy one, get one free**
- **Two for five**
- **Twenty percent off**
- **Reduced price**
- **Special offer**
- **Member price**
- **Loyalty-card price**
- **Clearance**
- **Valid until Friday**

Questions you can ask:

- “Is this product on sale?”
- “How does this promotion work?”
- “Do I need to buy two?”
- “Do I need a loyalty card?”
- “Is the discount applied automatically?”
- “When does the promotion end?”
- “Can I combine this offer with another discount?”

For example:

> “The label says two for five. Can I buy only one?”

The employee may explain:

> “Yes, but one item will cost three.”

## Compare Products

You may want to compare brands, sizes, ingredients, or prices.

Useful questions include:

- “What is the difference between these two?”
- “Which one is more popular?”
- “Which one is better value?”
- “Is there a cheaper option?”
- “Do you have a larger size?”
- “Does this come in a smaller package?”
- “Which brand would you recommend?”
- “Is there a store-brand version?”

A useful phrase is:

> “I’m looking for something similar, but less expensive.”

You can also explain your priorities:

- “I need something without added sugar.”
- “I’m looking for a high-protein option.”
- “I’d prefer something organic.”
- “I need a product that will last several days.”
- “I’m looking for the best value, not necessarily the cheapest product.”

## Ask About Ingredients and Dietary Needs

Checking ingredients is especially important if you have allergies or dietary preferences.

Useful questions include:

- “Does this contain nuts?”
- “Is this gluten-free?”
- “Is this suitable for vegetarians?”
- “Is this vegan?”
- “Does this contain dairy?”
- “Is there any added sugar?”
- “Where can I find lactose-free products?”
- “Do you have a dairy-free alternative?”

You can also say:

- “I’m allergic to peanuts.”
- “I cannot eat gluten.”
- “I’m looking for something without dairy.”
- “Could you help me check the ingredients?”

For serious allergies, always read the package carefully. A store employee may help you find information, but they may not be able to guarantee that a product is completely allergen-free.

## Buy Fruit, Vegetables, Meat, or Cheese

Some products are sold by weight rather than by package.

Useful phrases include:

- “I’d like one kilogram of apples, please.”
- “Could I have half a kilogram of tomatoes?”
- “I’d like three hundred grams of cheese.”
- “Could you give me six slices?”
- “Can I have two chicken breasts?”
- “That’s enough, thank you.”

The employee may ask:

- “How much would you like?”
- “Is this amount okay?”
- “Would you like it sliced?”
- “Would you like anything else?”
- “Do you need a bag?”

You can respond:

- “A little more, please.”
- “A little less, please.”
- “That amount is perfect.”
- “Could you slice it thinly?”
- “No, that’s everything.”

## Ask About Product Freshness

You may want to check whether food is fresh or how long it will last.

Useful questions include:

- “When does this expire?”
- “What is the use-by date?”
- “Was this baked today?”
- “Is this fresh?”
- “How long will this keep?”
- “Should I store this in the refrigerator?”
- “Can this be frozen?”

Common date labels include:

- **Best before** — the product may lose quality after this date
- **Use by** — the product should normally be consumed before this date
- **Packed on** — the date the product was packaged
- **Sell by** — a date mainly used by the store

## Handle Problems with a Product

You may notice that an item is damaged, open, expired, or incorrectly labelled.

You can say:

- “This package is damaged.”
- “This bottle is leaking.”
- “I think this product has expired.”
- “The seal is broken.”
- “This item was on the wrong shelf.”
- “Could I exchange this for another one?”
- “Could someone check this product?”

Stay polite and explain the problem clearly.

For example:

> “Excuse me, this carton is leaking. Could I replace it?”

## Speak at the Checkout

When you reach the checkout, the cashier may ask several common questions:

- “Did you find everything you needed?”
- “Do you have a loyalty card?”
- “Would you like a bag?”
- “Do you need a receipt?”
- “Are you paying by cash or card?”
- “Would you like to donate to charity?”
- “Do you need help packing?”

Useful answers include:

- “Yes, I found everything, thank you.”
- “No, I couldn’t find one item.”
- “I don’t have a loyalty card.”
- “Yes, one bag, please.”
- “No bag, thank you.”
- “I’ll pay by card.”
- “Could I have the receipt, please?”
- “Could I pay separately for these items?”

## Understand Checkout Instructions

When paying by card, you may hear:

- “Please insert your card.”
- “You can tap your card.”
- “Please enter your PIN.”
- “Your payment was declined.”
- “Would you like to try again?”
- “Please remove your card.”
- “The payment has gone through.”

If something goes wrong, you can say:

- “Could I try another card?”
- “Can I pay in cash instead?”
- “I think I was charged twice.”
- “Could you check the total?”
- “The price on the shelf was different.”
- “Could you remove this item, please?”

## Use Self-Checkout

At a self-checkout, you may need to ask an employee for help.

Useful phrases include:

- “Could you help me with the self-checkout?”
- “The machine is not scanning this item.”
- “It says there is an unexpected item.”
- “How do I weigh the vegetables?”
- “Where do I enter the product number?”
- “How can I remove an item?”
- “The machine has not printed my receipt.”

You may see or hear instructions such as:

- “Scan your first item.”
- “Place the item in the bagging area.”
- “Select your payment method.”
- “Approval needed.”
- “Please wait for assistance.”

## A Simple Grocery Store Conversation

A typical interaction may look like this:

> **Customer:** Excuse me, could you help me find oat milk?  
> **Employee:** Of course. It’s in aisle six, next to the regular milk.  
> **Customer:** Thank you. Do you have an unsweetened version?  
> **Employee:** Yes, we have two brands. This one is currently on sale.  
> **Customer:** How does the promotion work?  
> **Employee:** It’s twenty percent off if you have a loyalty card.  
> **Customer:** I don’t have one. Is there a cheaper alternative?  
> **Employee:** Yes, the store-brand version is less expensive.  
> **Customer:** Great. Could you show me where it is?

## A Simple Shopping Formula

When you need help, use this structure:

1. **Get attention:** “Excuse me, could you help me?”
2. **Explain what you need:** “I’m looking for brown rice.”
3. **Ask a specific question:** “Which aisle is it in?”
4. **Clarify the answer:** “Did you say aisle seven?”
5. **Thank the employee:** “Great, thank you for your help.”

## Practice Scenario

In this roleplay, you are shopping at FreshMart. The AI employee will help you find products, explain prices and promotions, and answer questions about the store.

During the conversation, try to:

- Ask where at least one product is located.
- Ask about a price or promotion.
- Compare two products.
- Ask about an ingredient or dietary requirement.
- Respond to one small problem, such as an unavailable product or unclear price.
- Complete the purchase or end the interaction politely.

Focus on communicating your needs clearly. You do not need perfect grammar to have a successful conversation in a grocery store.`),
  category: {
    categoryTitle: i18n._('Shopping'),
    categoryId: 'shopping',
  },
  input: [],

  subTitle: i18n._(
    'Practice finding products, comparing prices, understanding promotions, and paying at checkout',
  ),
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
    'Hi, welcome to FreshMart. I’m Nova. Is there anything specific you’re looking for today?',
  illustrationDescription:
    'A bright modern grocery store aisle where a friendly employee is helping a customer holding a shopping list. Shelves contain fruit, vegetables, packaged food, and clearly displayed price labels.',
  imageSrc: '/role/a7e56489-d409-4b73-ad87-1473565975dc.webp',
  voice: 'verse',
});
