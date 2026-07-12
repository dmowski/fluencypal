import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getInTheRestaurantScenario = (
  i18n: I18n,
  lang: SupportedLanguage,
): RolePlayInstruction => ({
  id: 'in-the-restaurant',
  title: i18n._('In the Restaurant'),
  shortTitle: i18n._('Restaurant'),
  landingHighlight: i18n._(
    'Practice asking for a table, understanding the menu, ordering food, making special requests, and paying the bill.',
  ),
  category: {
    categoryTitle: i18n._('Social'),
    categoryId: 'social',
  },
  input: [],

  subTitle: i18n._(
    'Practice ordering food, asking about the menu, and interacting with restaurant staff',
  ),
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
    'Good evening. Welcome to the Riverside Kitchen. I’m Ash, and I’ll be looking after you today. Do you have a reservation with us?',
  illustrationDescription:
    'A warm and comfortable restaurant where a friendly waiter holding a notepad is speaking with a customer seated at a table. The customer is looking at a menu, with glasses, cutlery, and a small plate on the table.',
  imageSrc: '/role/acde68cd-1db6-4b69-be42-d2071b9ee1e8.webp',
  voice: 'ash',

  contentPage:
    i18n._(`Eating at a restaurant involves several short conversations: asking for a table, understanding the menu, ordering food, making requests, handling problems, and paying the bill.

You do not need complicated sentences. Clear questions, polite requests, and confirming important details will help you communicate successfully.

## Arriving at the Restaurant

When you enter, a member of staff may ask:

- “Do you have a reservation?”
- “What name is the reservation under?”
- “How many people are in your party?”
- “Would you prefer to sit inside or outside?”
- “Would you like a table by the window?”
- “Is this table all right?”

If you have a reservation, you can say:

- “Hello, I have a reservation.”
- “The reservation is under Dmowski.”
- “I booked a table for two at seven.”
- “We should have a reservation for four people.”
- “One more person will be joining us shortly.”

If you do not have a reservation, say:

- “Do you have a table for two?”
- “We don’t have a reservation. Is there anything available?”
- “How long is the wait for a table?”
- “Could we sit outside?”
- “Would it be possible to sit somewhere quiet?”

You may hear:

- “Your table will be ready in about fifteen minutes.”
- “We only have tables outside at the moment.”
- “We can seat you at the bar.”
- “Unfortunately, we are fully booked.”
- “Please follow me.”

## Asking for the Menu

After you sit down, the waiter may give you a menu and ask about drinks.

Useful phrases include:

- “Could we see the menu, please?”
- “Do you have a menu in English?”
- “Could I have the drinks menu?”
- “Do you have a children’s menu?”
- “Is there a separate dessert menu?”
- “Could we have a few more minutes?”

If you are not ready to order, say:

- “We’re still deciding.”
- “Could you give us another minute?”
- “I’m ready to order drinks, but not food yet.”
- “Could you come back in five minutes?”

You do not need to rush. It is normal to ask for more time.

## Ordering Drinks

The waiter may ask:

- “Can I get you something to drink?”
- “Would you like still or sparkling water?”
- “Can I bring you anything from the bar?”
- “Would you like to see the wine list?”

You can order by saying:

- “Could I have a glass of water, please?”
- “I’d like a sparkling water.”
- “Could we have a bottle of still water for the table?”
- “I’ll have an orange juice.”
- “Could I get a coffee after the meal?”
- “What non-alcoholic drinks do you have?”
- “Do you have any alcohol-free beer?”

Useful water vocabulary:

- **Still water** — water without bubbles
- **Sparkling water** — carbonated water
- **Tap water** — water from the public water supply
- **Bottled water** — water served from a bottle

You can ask:

- “Is tap water available?”
- “Is the water complimentary?”
- “Could we have some ice?”
- “Could I have that without ice?”

## Understanding the Menu

Menus often contain unfamiliar ingredients or cooking methods. It is completely normal to ask questions.

Useful questions include:

- “What is this dish?”
- “What does this come with?”
- “How is it prepared?”
- “What kind of meat is used?”
- “Is this dish spicy?”
- “Is it very rich?”
- “Is this served hot or cold?”
- “What is the sauce made from?”
- “Does this come with a side dish?”
- “Is this enough for one person?”
- “Could you explain the difference between these two dishes?”

Common menu sections include:

- **Starter or appetizer** — a small dish served before the main course
- **Main course or entrée** — the central dish of the meal
- **Side dish** — a smaller dish served with the main course
- **Dessert** — a sweet dish served at the end
- **Special** — a dish that may only be available that day
- **Set menu** — several courses offered together for a fixed price

## Ask for a Recommendation

When you are unsure what to order, ask the waiter for help.

You can say:

- “What would you recommend?”
- “What is your most popular dish?”
- “What is today’s special?”
- “Which dish is not too spicy?”
- “What would you recommend for someone who likes fish?”
- “I’d like something light. What would you suggest?”
- “Which vegetarian dish would you recommend?”
- “What is the difference between these two options?”

It helps to explain your preferences:

- “I like spicy food.”
- “I’d prefer something light.”
- “I don’t eat red meat.”
- “I’m looking for something filling.”
- “I’d like to try something local.”
- “I don’t like very sweet sauces.”

A good recommendation should match what you enjoy, not simply what is popular.

## Place Your Order

Common ways to order include:

- “I’d like the tomato soup to start.”
- “I’ll have the grilled salmon.”
- “Could I get the chicken salad?”
- “For my main course, I’d like the pasta.”
- “I think I’ll try the daily special.”
- “We’d like to share the starter.”
- “Could we order one more side dish?”

A typical order might sound like this:

> “I’d like the mushroom soup as a starter and the grilled chicken for my main course. Could I have the salad instead of the fries?”

The waiter may ask:

- “Are you ready to order?”
- “What would you like to start with?”
- “And for your main course?”
- “Would you like any side dishes?”
- “How would you like your steak cooked?”
- “Would you like anything else?”

## Ask for Changes to a Dish

Restaurants can often make small changes, although not every request will be possible.

Useful phrases include:

- “Could I have this without onions?”
- “Could you leave out the cheese?”
- “Could I have the sauce on the side?”
- “Can I replace the fries with a salad?”
- “Could I add some grilled vegetables?”
- “Could you make it less spicy?”
- “Could I have the dressing separately?”
- “Is it possible to order a smaller portion?”
- “Could we share this dish?”

The waiter may respond:

- “Certainly.”
- “That should be possible.”
- “There is an additional charge.”
- “Unfortunately, the sauce is prepared in advance.”
- “You can choose a different side.”
- “Let me check with the kitchen.”

## Explain Allergies and Dietary Requirements

Tell the waiter clearly if you have an allergy or an important dietary restriction.

You can say:

- “I’m allergic to peanuts.”
- “I have a severe nut allergy.”
- “I cannot eat gluten.”
- “I’m lactose intolerant.”
- “I don’t eat meat.”
- “I’m vegan.”
- “I need a dairy-free option.”
- “Does this contain shellfish?”
- “Is this suitable for vegetarians?”
- “Could you check with the kitchen?”

Useful questions include:

- “Is this prepared near any nuts?”
- “Does the sauce contain dairy?”
- “Is the soup made with chicken stock?”
- “Does this contain raw egg?”
- “Is there a gluten-free version?”
- “Can this dish be prepared without cheese?”

For a serious allergy, do not rely only on symbols printed on the menu. Explain the allergy directly and ask the waiter to confirm with the kitchen.

## Choose How Meat Is Cooked

When ordering steak or some other meats, the waiter may ask:

> “How would you like that cooked?”

Common options include:

- **Rare** — cooked briefly and red inside
- **Medium rare** — warm and red in the centre
- **Medium** — pink in the centre
- **Medium well** — only slightly pink
- **Well done** — fully cooked through

You can answer:

- “Medium, please.”
- “I’d like it well done.”
- “Could you cook it medium rare?”
- “Please make sure it is fully cooked.”

## Confirm Your Order

Before leaving the table, the waiter may repeat the order.

Listen carefully and correct any mistakes:

- “Yes, that’s correct.”
- “Actually, I ordered the salmon, not the chicken.”
- “The salad should be without onions.”
- “We ordered two soups, not one.”
- “Could you repeat the side dishes?”
- “Does that include the extra vegetables?”
- “Yes, but please put the sauce on the side.”

Repeating important details helps prevent misunderstandings.

## Ask for Something During the Meal

You may need an extra item after the food arrives.

Useful requests include:

- “Could we have some more water?”
- “Could I get another fork?”
- “Could we have some extra napkins?”
- “Could I have some salt and pepper?”
- “Could you bring us another plate?”
- “Could I have some ketchup?”
- “Could we get another basket of bread?”
- “Could you warm this up, please?”
- “Could I order another drink?”

To get the waiter’s attention politely, say:

- “Excuse me.”
- “Sorry, could you help us?”
- “When you have a moment, could we have some more water?”

Avoid shouting or snapping your fingers.

## Respond When the Waiter Checks on You

The waiter may ask:

- “How is everything?”
- “Is your food all right?”
- “Can I get you anything else?”
- “Are you enjoying your meal?”

If everything is good, say:

- “Everything is great, thank you.”
- “The food is delicious.”
- “Yes, everything is fine.”
- “We’re enjoying it, thank you.”

If something is wrong, this is a good opportunity to explain it.

## Handle an Incorrect Order

Mistakes can happen. Explain the problem calmly and clearly.

You can say:

- “Excuse me, I think this is the wrong dish.”
- “I ordered the salmon, but this is chicken.”
- “I asked for this without cheese.”
- “This isn’t what I ordered.”
- “We’re still waiting for one dish.”
- “I think this belongs to another table.”
- “Could you check our order, please?”

Ask for a clear solution:

- “Could you replace it, please?”
- “Could you bring the dish I ordered?”
- “Could you remove this from the bill?”
- “Could you check how long the correct dish will take?”
- “Would it be possible to keep the other meals warm?”

## Complain About the Food Politely

If the food is not properly prepared, describe the specific problem.

Useful phrases include:

- “The food is cold.”
- “The steak is overcooked.”
- “This is much spicier than I expected.”
- “The chicken does not seem fully cooked.”
- “The soup is too salty.”
- “There is an ingredient I asked to have removed.”
- “This dish tastes unusual.”
- “Could you ask the kitchen to check it?”

A polite but clear complaint might be:

> “Excuse me, I ordered the steak medium, but it is well done. Would it be possible to replace it?”

You do not need to apologize for reporting a genuine problem.

## Ask About a Delayed Order

If you have been waiting a long time, ask for an update:

- “Excuse me, could you check on our order?”
- “Do you know how much longer it will take?”
- “We’ve been waiting for about forty minutes.”
- “Is there a delay in the kitchen?”
- “One person at our table still hasn’t received their food.”
- “Could all the meals be served together?”
- “We need to leave soon. Is the order almost ready?”

Stay factual and explain what you need.

## Order Dessert or Coffee

After the main course, the waiter may ask:

- “Would you like to see the dessert menu?”
- “Can I interest you in dessert?”
- “Would you like coffee or tea?”
- “Can I clear these plates?”

You can respond:

- “Could we see the dessert menu?”
- “What desserts do you recommend?”
- “We’ll share one dessert.”
- “I’ll have a coffee, please.”
- “Could I have a decaffeinated coffee?”
- “No dessert, thank you.”
- “Just the bill, please.”

## Ask to Take Leftovers Home

In some countries and restaurants, you can ask to take unfinished food with you.

Useful phrases include:

- “Could I take this home?”
- “Could you pack this for me?”
- “Could I have a takeaway box?”
- “Could you pack the sauce separately?”
- “Is it safe to reheat this tomorrow?”

You may also hear:

- “Would you like me to box that for you?”
- “Would you like to take the rest with you?”

## Ask for the Bill

At the end of the meal, say:

- “Could we have the bill, please?”
- “Could I get the check, please?”
- “We’re ready to pay.”
- “Could you bring the card machine?”
- “Can we pay at the table?”
- “Do we pay here or at the counter?”

**Bill** is more common in British English, while **check** is more common in American English.

## Pay Together or Separately

The waiter may ask:

- “Will that be together or separate?”
- “Would you like to split the bill?”
- “How would you like to pay?”

Useful responses include:

- “We’ll pay together.”
- “Could we pay separately?”
- “Could we split the bill equally?”
- “I’ll pay for everything.”
- “Could I pay for these two items?”
- “Can we use two different cards?”
- “Could you divide the total between three people?”

If you need to explain exactly what you ordered, say:

> “I had the soup, the salmon, and one sparkling water.”

## Check the Bill

Before paying, check that the items and total are correct.

You can say:

- “Could you explain this charge?”
- “I think there is an extra item on the bill.”
- “We only ordered one bottle of water.”
- “Was the service charge included?”
- “Is the tip already included?”
- “Could you remove this item? It was sent back.”
- “Could I have an itemized bill?”
- “Could I have a receipt?”

An **itemized bill** lists each food and drink item separately.

## Pay and Leave a Tip

Useful payment phrases include:

- “I’ll pay by card.”
- “Can I pay in cash?”
- “Do you accept contactless payments?”
- “Could I pay in a different currency?”
- “Could I have a receipt?”
- “Can I add a tip by card?”
- “Is service included?”
- “Please keep the change.”

Tipping customs vary by country. Check whether a service charge has already been added before leaving an additional tip.

## A Simple Restaurant Conversation

A typical conversation may look like this:

> **Waiter:** Good evening. Do you have a reservation?  
> **Customer:** Yes, I booked a table for two under Dmowski.  
> **Waiter:** Certainly. Please follow me. Can I bring you something to drink?  
> **Customer:** Could we have a bottle of still water, please?  
> **Waiter:** Of course. Are you ready to order?  
> **Customer:** I need another minute. What would you recommend for someone who likes fish?  
> **Waiter:** The grilled salmon is very popular. It comes with potatoes and vegetables.  
> **Customer:** Does the sauce contain dairy?  
> **Waiter:** Yes, but we can serve it without the sauce.  
> **Customer:** Great. I’ll have the salmon without the sauce. Could I replace the potatoes with a salad?  
> **Waiter:** Certainly.  
> **Customer:** Thank you.

## A Simple Restaurant Formula

Use this structure during a restaurant visit:

1. **Arrive:** Confirm your reservation or ask for a table.
2. **Ask:** Request the menu and ask about unfamiliar dishes.
3. **Choose:** Order food and drinks clearly.
4. **Clarify:** Explain allergies, preferences, and requested changes.
5. **Confirm:** Listen while the waiter repeats the order.
6. **Respond:** Ask for anything else you need during the meal.
7. **Resolve:** Explain any problems and request a solution.
8. **Pay:** Ask for the bill, check it, and choose a payment method.

For example:

> “I’d like the grilled chicken, but could I have it without onions and with a salad instead of fries?”

## Practice Scenario

In this roleplay, you are dining at the Riverside Kitchen. The AI waiter will welcome you, help you understand the menu, take your order, and respond to your requests.

During the conversation, try to:

- Ask for a table or confirm a reservation.
- Order a drink and a main course.
- Ask at least one question about a menu item.
- Request a recommendation.
- Mention a dietary preference or ask for a change.
- Confirm an important detail about your order.
- Respond to one small problem with the meal or service.
- Ask for the bill and explain how you would like to pay.

Focus on communicating clearly and politely. Perfect grammar is less important than making sure the waiter understands your order and your needs.`),
});
