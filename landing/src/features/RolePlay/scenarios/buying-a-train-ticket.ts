import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getBuyingATrainTicketScenario = (
  i18n: I18n,
  lang: SupportedLanguage,
): RolePlayInstruction => ({
  id: 'buying-a-train-ticket',
  title: i18n._('Buying a Train Ticket'),
  shortTitle: i18n._('Train Ticket'),
  landingHighlight: i18n._(
    'Practice asking about train times, comparing ticket options, confirming connections, and buying the right ticket for your journey.',
  ),
  contentPage:
    i18n._(`Buying a train ticket is easier when you know which details to provide and which questions to ask. You usually need to explain your destination, travel date, preferred departure time, and whether you need a one-way or return ticket.

You may also need to compare routes, understand transfers, reserve a seat, or ask about discounts.

## Start the Conversation

At a ticket counter, you can begin with:

- “Hello, I’d like to buy a ticket, please.”
- “Could I get a ticket to Berlin?”
- “I need to travel to Kraków tomorrow.”
- “I’d like to know the best way to get to Prague.”
- “Could you help me find a train to Warsaw?”

The ticket agent may ask:

- “Where are you travelling to?”
- “When would you like to leave?”
- “Is that for today?”
- “What time would you like to travel?”
- “Do you need a one-way or return ticket?”
- “How many passengers are travelling?”

You can answer clearly and directly:

> “I’d like a one-way ticket to Gdańsk for tomorrow morning.”

## Say When You Want to Travel

Be as specific as possible about your preferred date and time.

Useful phrases include:

- “I’d like to travel today.”
- “I need a ticket for tomorrow morning.”
- “I’d like to leave at around three.”
- “Is there a train after six?”
- “What is the earliest train?”
- “What is the last train tonight?”
- “I’d prefer to arrive before noon.”
- “I can travel at any time after five.”

The agent may offer several options:

> “There is a direct train at 9:20 and another at 10:45.”

You can respond:

- “I’ll take the 9:20 train.”
- “Is there anything earlier?”
- “What time does the second train arrive?”
- “Which option is faster?”
- “Could you check a later train?”

## Choose a One-Way or Return Ticket

A **one-way ticket** covers only the journey to your destination.

A **return ticket** covers the journey to your destination and the journey back.

Useful phrases:

- “A one-way ticket, please.”
- “I’d like a return ticket.”
- “I’m coming back on Sunday.”
- “Can the return journey be on a different day?”
- “Is an open return available?”
- “Is it cheaper to buy a return ticket?”

The agent may ask:

> “When would you like to return?”

You can answer:

> “I’d like to return on Monday evening, preferably after six.”

## Ask About Direct Trains and Transfers

A direct train takes you to your destination without changing trains.

A journey with a transfer requires you to leave one train and board another.

Useful questions include:

- “Is it a direct train?”
- “Do I need to change trains?”
- “How many transfers are there?”
- “Where do I need to change?”
- “How much time do I have between trains?”
- “Is fifteen minutes enough for the connection?”
- “Will the connecting train wait if the first train is delayed?”
- “Do I use the same ticket for both trains?”

You may hear:

- “You need to change trains in Poznań.”
- “There is one transfer.”
- “You have twenty minutes between trains.”
- “The direct train is slower but more convenient.”
- “The faster option requires two changes.”

When comparing routes, think about both travel time and convenience.

## Understand Departure and Arrival Times

Train schedules usually include:

- Departure time
- Arrival time
- Journey duration
- Train number
- Platform number
- Number of transfers

Useful questions:

- “What time does the train leave?”
- “What time does it arrive?”
- “How long does the journey take?”
- “Which platform does it leave from?”
- “What is the train number?”
- “How early should I arrive?”
- “Where can I check for platform changes?”

To confirm what you heard, say:

- “Did you say the train leaves at 8:15?”
- “So I arrive at 11:40, correct?”
- “Was that platform four or platform fourteen?”
- “Could you write the departure time down for me?”

Confirming numbers is especially useful because times and platform numbers can sound similar.

## Compare Ticket Types

Depending on the railway, several types of tickets may be available.

Common options include:

- Standard ticket
- First-class ticket
- Second-class ticket
- Flexible ticket
- Non-refundable ticket
- Off-peak ticket
- Advance ticket
- Sleeper ticket
- Discounted ticket

Questions you can ask:

- “What is the cheapest ticket?”
- “What is the difference between these options?”
- “Can I change the departure time?”
- “Is this ticket refundable?”
- “Can I cancel it?”
- “Is the ticket valid on any train?”
- “Do I have to take this specific train?”
- “Are there any restrictions?”

A cheaper ticket may offer less flexibility.

For example:

> “This ticket is cheaper, but it is only valid on the 10:30 train and cannot be refunded.”

Before buying, make sure you understand the conditions.

## Ask About First and Second Class

Some trains offer different travel classes.

You can ask:

- “How much is a second-class ticket?”
- “What is the price for first class?”
- “What is included in first class?”
- “Is there much difference between the two?”
- “Does first class include a meal?”
- “Is Wi-Fi available in both classes?”

You can choose by saying:

- “Second class is fine, thank you.”
- “I’ll take the first-class option.”
- “I’d prefer the cheaper ticket.”

## Ask About Seat Reservations

Some tickets include an assigned seat, while others allow you to sit in any available seat.

Useful questions include:

- “Is a seat reservation included?”
- “Do I need to reserve a seat?”
- “Can I choose my seat?”
- “Could I have a window seat?”
- “Could I have an aisle seat?”
- “Can we sit together?”
- “Is there a table seat available?”
- “Is the train likely to be busy?”

The agent may say:

- “Your seat is in carriage seven.”
- “You are in seat 42.”
- “The reservation costs extra.”
- “You can sit in any unreserved seat.”
- “There are no seats together on that train.”

You can respond:

> “Could you check the next train to see whether two seats together are available?”

## Ask About Discounts

You may qualify for a reduced fare based on your age, status, railway card, or group size.

Possible discounts include:

- Student discounts
- Youth discounts
- Senior discounts
- Child tickets
- Family tickets
- Group tickets
- Railway-card discounts

Useful questions:

- “Are there any discounts available?”
- “Is there a student discount?”
- “Do children need a ticket?”
- “Is there a cheaper family ticket?”
- “Do you offer group discounts?”
- “Can I use my railway card?”
- “Do I need to show proof of eligibility?”

The agent may ask to see a student card, identification document, or discount card.

## Travel with Luggage, a Bicycle, or a Pet

Additional rules or tickets may apply when travelling with large luggage, bicycles, or animals.

Useful questions include:

- “Is luggage included in the ticket?”
- “Is there a luggage limit?”
- “Where can I store my suitcase?”
- “Can I take a bicycle on this train?”
- “Do I need a bicycle reservation?”
- “Can I travel with a dog?”
- “Do I need to buy a ticket for my dog?”
- “Are pets allowed in every carriage?”

You may also ask about accessibility:

- “Is the train wheelchair accessible?”
- “Is step-free boarding available?”
- “Can someone help me board the train?”
- “Is there space for a wheelchair?”

## Ask About Services on the Train

For longer journeys, you may want to know what is available on board.

You can ask:

- “Is there Wi-Fi on the train?”
- “Are there power sockets?”
- “Is there a restaurant carriage?”
- “Can I buy food on board?”
- “Is there a toilet on the train?”
- “Is air conditioning available?”
- “Is this a sleeper train?”
- “Are beds or private compartments available?”

## Understand the Price

Before paying, confirm the total price and what it includes.

Useful questions include:

- “How much is the ticket?”
- “Is that the total price?”
- “Does that include the seat reservation?”
- “Are there any additional fees?”
- “Is the return journey included?”
- “Why is this train more expensive?”
- “Is there a cheaper departure time?”

You can also compare options:

> “The direct train costs more. How much would I save by taking the train with one transfer?”

## Pay for the Ticket

At the counter, the agent may ask:

- “How would you like to pay?”
- “Are you paying by cash or card?”
- “Would you like a paper or electronic ticket?”
- “Would you like the receipt?”

Useful answers include:

- “I’ll pay by card.”
- “Can I pay in cash?”
- “Could I have a paper ticket, please?”
- “Can you send the ticket to my email?”
- “Could I have a receipt?”
- “Where can I find the booking reference?”

After receiving the ticket, check:

- Your name, if required
- The destination
- The travel date
- The departure time
- The train number
- The carriage and seat
- The ticket conditions

## Handle Common Problems

### The preferred train is sold out

You can ask:

- “Is there another train available?”
- “What is the next departure?”
- “Are there seats in first class?”
- “Can I travel without a seat reservation?”
- “Could you check a different route?”

### The ticket is too expensive

You can say:

- “Is there a cheaper option?”
- “Would travelling later be less expensive?”
- “Is the train with a transfer cheaper?”
- “Are there any discounted tickets left?”
- “Could I take a slower train?”

### The connection is too short

You can ask:

- “Is there an option with a longer transfer?”
- “What happens if I miss the connection?”
- “Can I use the next train?”
- “Will my ticket remain valid?”

### Your plans may change

Ask:

- “Can I change this ticket later?”
- “How much does it cost to change it?”
- “Can I receive a refund?”
- “What happens if I miss the train?”
- “Is a flexible ticket available?”

### The train is delayed or cancelled

Useful questions include:

- “Has the train been delayed?”
- “How long is the delay?”
- “Has the train been cancelled?”
- “Can I use this ticket on another train?”
- “Where can I request a refund?”
- “Will I miss my connection?”
- “Can you help me find another route?”

## Understand Station Announcements

At the station, you may hear announcements such as:

- “The train has been delayed.”
- “The platform has changed.”
- “The train is now departing from platform eight.”
- “The train has been cancelled.”
- “This train terminates here.”
- “Please do not board this train.”
- “The train is ready for boarding.”
- “Mind the gap between the train and the platform.”

Check the departure board regularly, because platform numbers may change shortly before departure.

## A Simple Ticket-Buying Conversation

A typical conversation may look like this:

> **Traveller:** Hello, I’d like a ticket to Kraków for tomorrow morning.  
> **Agent:** Certainly. Would you like a one-way or return ticket?  
> **Traveller:** A return ticket, please. I’d like to come back on Sunday evening.  
> **Agent:** There is a direct train tomorrow at 9:15. It arrives at 11:50.  
> **Traveller:** Is a seat reservation included?  
> **Agent:** Yes. Would you prefer a window or aisle seat?  
> **Traveller:** A window seat, please. How much is the ticket?  
> **Agent:** The total is 160 złoty.  
> **Traveller:** Is there a cheaper option?  
> **Agent:** There is another train at 10:05 with one transfer. It costs 125 złoty.  
> **Traveller:** How long is the transfer?  
> **Agent:** Twenty-five minutes.  
> **Traveller:** That sounds fine. I’ll take that option.

## A Simple Ticket-Buying Formula

When buying a ticket, follow this structure:

1. **Destination:** Say where you want to go.
2. **Date and time:** Explain when you want to travel.
3. **Ticket type:** Choose one-way or return.
4. **Route:** Ask whether the journey is direct.
5. **Conditions:** Confirm the price, flexibility, and seat reservation.
6. **Final check:** Repeat the departure time and platform information.
7. **Payment:** Choose how you want to pay.

For example:

> “I’d like a return ticket to Vienna for Friday morning, returning on Sunday evening. I’d prefer a direct train and a window seat.”

## Practice Scenario

In this roleplay, you are buying a train ticket at Central Station. The AI ticket agent will help you compare departures, ticket types, routes, and prices.

During the conversation, try to:

- Explain your destination and preferred travel time.
- Choose between a one-way and return ticket.
- Ask whether the journey is direct.
- Confirm the departure and arrival times.
- Ask about the price and ticket conditions.
- Request a seat preference.
- Respond to one complication, such as a sold-out train, a transfer, or a higher-than-expected price.
- Confirm the final journey details before paying.

Focus on getting the information you need and checking that you have understood it correctly. Perfect grammar is less important than choosing the correct journey and ticket.`),
  input: [],
  category: {
    categoryTitle: i18n._('Travel'),
    categoryId: 'travel',
  },

  subTitle: i18n._('Practice comparing train times, fares, routes, and ticket options'),
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
    'Hello, welcome to Central Station. I’m Echo. Where would you like to travel, and when are you planning to leave?',
  illustrationDescription:
    'A busy modern train station with a traveller carrying a backpack and speaking to a helpful ticket agent behind a counter. A large departure board in the background displays train times, platforms, and destinations.',
  imageSrc: '/role/36b7ea13-f429-46ae-a6c7-19d3206ab6b0.webp',
  voice: 'ash',
});
