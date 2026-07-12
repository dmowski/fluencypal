import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getHotelCheckInScenario = (i18n: I18n, lang: SupportedLanguage): RolePlayInstruction => ({
  id: 'hotel-check-in',
  title: i18n._('Hotel Check-In Conversation'),
  shortTitle: i18n._('Hotel Check-In'),
  landingHighlight: i18n._(
    'Practice checking into a hotel, confirming your reservation, asking about amenities, and solving common problems at reception.',
  ),
  contentPage:
    i18n._(`Checking into a hotel usually follows a predictable pattern. The receptionist confirms your identity and reservation, explains the hotel’s services, and gives you access to your room.

Knowing a few key phrases can make the process much easier, especially when you are travelling in a country where you do not speak the local language confidently.

## What You May Need at Check-In

The receptionist may ask you for:

- Your full name
- A passport or identity document
- Your booking confirmation
- A payment card
- The number of guests
- Your expected check-out date

You can begin the conversation with:

- “Hello, I have a reservation.”
- “Hi, I’d like to check in.”
- “The reservation should be under Alex Dmowski.”
- “I booked the room through a booking website.”
- “Here is my booking confirmation.”

If the receptionist cannot find your reservation, stay calm and provide more details:

- “Could you check the booking number?”
- “I received a confirmation email yesterday.”
- “The reservation may be under my partner’s name.”
- “Would it help if I showed you the confirmation?”

## Confirm the Important Details

Before accepting the room, confirm that the reservation details are correct.

You may want to check:

- The room type
- The number of nights
- The total price
- Whether breakfast is included
- The number and size of beds
- The check-out time
- Any additional fees or deposits

Useful questions include:

- “Could you confirm which room type I booked?”
- “Is breakfast included in the price?”
- “What time is check-out?”
- “Is there a security deposit?”
- “Are there any additional charges?”
- “Has the room already been paid for?”
- “Could I have a receipt, please?”

Do not be afraid to ask the receptionist to repeat information:

- “Sorry, could you repeat that?”
- “Could you speak a little more slowly, please?”
- “Did you say check-out is at eleven?”
- “Could you write that down for me?”

## Ask About Hotel Services

Check-in is a good time to ask practical questions about your stay.

### Wi-Fi

- “Is Wi-Fi included?”
- “What is the Wi-Fi password?”
- “Does the Wi-Fi work inside the rooms?”

### Breakfast

- “What time is breakfast served?”
- “Where is the breakfast area?”
- “Do you have vegetarian options?”
- “Can I add breakfast to my reservation?”

### Hotel facilities

- “Does the hotel have a gym?”
- “Is there a place where I can leave my luggage?”
- “Do you have laundry service?”
- “Is room service available?”
- “Is there a restaurant in the hotel?”

### Transport and local information

- “Could you help me call a taxi?”
- “What is the easiest way to get to the city centre?”
- “Is there a bus stop nearby?”
- “Could you recommend a restaurant in the area?”

## Make a Special Request

It is best to make important requests before arriving, but you can also ask at reception.

Common requests include:

- A quiet room
- A room on a higher or lower floor
- Two separate beds
- A larger bed
- A baby cot
- An accessible room
- Extra towels or pillows
- Early check-in
- Late check-out
- A room away from the lift

Useful phrases:

- “Would it be possible to have a quiet room?”
- “Could I have a room away from the lift?”
- “Do you have a room on a higher floor?”
- “Could we have two separate beds?”
- “Would it be possible to check out later?”
- “Could you send an extra towel to the room?”

Using “Could I…?”, “Would it be possible…?” and “Do you have…?” makes your request sound polite and natural.

## Handle Common Problems

Sometimes the room is not ready, the booking details are incorrect, or the room does not match what you reserved.

### The room is not ready

- “Do you know when the room will be ready?”
- “Could I leave my luggage here?”
- “Could you let me know when I can check in?”
- “Is there somewhere I can wait?”

### The reservation cannot be found

- “I have a confirmation email. Could you check it?”
- “Could you search using the booking reference?”
- “The reservation may be under a different name.”
- “Could you contact the booking platform?”

### The room is different from the booking

- “I believe I booked a double room.”
- “My confirmation says that breakfast is included.”
- “I requested two separate beds.”
- “Could you check the original reservation?”
- “Is another room available?”

### There is a problem with the room

- “The air conditioning does not seem to work.”
- “The room has not been cleaned yet.”
- “There is a lot of noise coming from the next room.”
- “The Wi-Fi is not working in my room.”
- “Could someone take a look at it?”
- “Would it be possible to change rooms?”

Describe the problem clearly, explain what you expected, and ask for a specific solution.

## Understand Common Receptionist Questions

A receptionist may ask:

- “May I have your name?”
- “Could I see your passport or ID?”
- “Do you have your booking confirmation?”
- “How many nights will you be staying?”
- “Will you be paying by card or cash?”
- “Would you like breakfast included?”
- “Do you need help with your luggage?”
- “Would you like a wake-up call?”
- “Do you have any special requests?”

You do not need to give long answers. Clear and direct responses are usually best.

For example:

> “Yes, the reservation is under Dmowski. I’ll be staying for three nights, and I’ll pay by card.”

## A Simple Check-In Conversation

A typical conversation may follow this structure:

1. Greet the receptionist.
2. Say that you have a reservation.
3. Give your name and identification.
4. Confirm your booking details.
5. Ask about breakfast, Wi-Fi, or check-out.
6. Make any special requests.
7. Collect your room key and directions.
8. Thank the receptionist.

Example:

> **Guest:** Hello, I have a reservation under Dmowski.  
> **Receptionist:** Certainly. May I see your passport, please?  
> **Guest:** Of course. Here you are. Is breakfast included in my booking?  
> **Receptionist:** Yes, it is served from seven until ten.  
> **Guest:** Great. Could you also tell me the Wi-Fi password?  
> **Receptionist:** It is written on your key card.  
> **Guest:** Thank you. What time is check-out?  
> **Receptionist:** Check-out is at eleven.  
> **Guest:** Perfect. Thank you for your help.

## Practice Scenario

In this roleplay, you have arrived at a hotel where you already have a reservation. The AI receptionist will ask for your details, explain the hotel’s services, and respond to your questions.

During the conversation, try to:

- Introduce yourself and confirm your reservation.
- Ask at least two questions about the hotel.
- Make one polite request.
- Confirm an important detail by repeating it.
- Respond to an unexpected issue if one occurs.

Focus on communicating clearly rather than using perfect grammar. A successful check-in is one where both you and the receptionist understand what needs to happen next.`),
  category: {
    categoryTitle: i18n._('Travel'),
    categoryId: 'travel',
  },
  input: [],

  subTitle: i18n._(
    'Practice confirming a reservation, asking about hotel services, and handling check-in problems',
  ),
  instructionToAi: `You are Onyx, a professional and friendly receptionist at the Grand Skyline Hotel. The user is a guest arriving to check in for an existing reservation.

Run a realistic hotel check-in conversation suitable for a language learner.

During the conversation:
- Begin by greeting the guest and asking for the name on the reservation.
- Ask for only one or two pieces of information at a time.
- Confirm the room type, number of nights, number of guests, and check-out date.
- Ask for identification and explain any payment or deposit requirements.
- Give realistic information about breakfast, Wi-Fi, check-out time, luggage storage, and hotel facilities.
- Give the user opportunities to ask questions and make special requests.
- Introduce one manageable complication, such as the room not being ready, a bed-type mismatch, breakfast not being included, or a deposit being required.
- Allow the user to clarify the problem and request a solution.
- Respond helpfully, but do not immediately solve every issue without discussion.
- Keep your responses concise and natural.
- Match the user's language level.
- Do not correct every language mistake during the roleplay.
- Stay in character as a receptionist unless the user explicitly asks to stop the scenario.
- Conclude by giving the room number, key-card instructions, breakfast information, and directions to the lift.`,
  exampleOfFirstMessageFromAi:
    'Good afternoon. Welcome to the Grand Skyline Hotel. My name is Onyx. Are you checking in today? May I have the name on your reservation, please?',
  illustrationDescription:
    'A modern hotel lobby with a friendly receptionist behind the front desk speaking with a newly arrived traveller. The traveller has a suitcase and is holding a passport or booking confirmation.',
  imageSrc: '/role/4db47c61-ff6c-448b-8528-65f4d4fa5992.webp',
  voice: 'verse',
});
