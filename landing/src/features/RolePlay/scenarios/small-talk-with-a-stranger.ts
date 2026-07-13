import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getSmallTalkWithAStrangerScenario = (
  i18n: I18n,
  lang: SupportedLanguage,
): RolePlayInstruction => ({
  id: 'small-talk-with-a-stranger',
  highlightOnLandingPage: true,
  title: i18n._('Small Talk Practice'),
  shortTitle: i18n._('Small Talk'),
  landingHighlight: i18n._(
    'Engage in a casual conversation with a friendly stranger at a social event. Perfect for practicing how to break the ice and keep the chat going naturally.',
  ),
  contentPage:
    i18n._(`Talking to a stranger can feel uncomfortable because neither person knows what to say yet. The goal is not to sound especially clever or interesting. Your first goal is simply to make the other person feel comfortable and discover something you can talk about together.

The advice below is inspired by ideas from Charles Duhigg’s book *Supercommunicators*.

## How to Start a Conversation

Use the situation you already share. You do not need an original or impressive opening line.

Try making a simple observation and adding an easy question:

- “This place is busier than I expected. Have you been here before?”
- “How do you know the host?”
- “What brought you to this event?”
- “That looks interesting. What are you drinking?”
- “Is this your first time at an event like this?”

Questions about the immediate situation feel natural because they give the other person an obvious way to respond.

## Ask Questions That Reveal More Than Facts

Basic questions are useful for starting a conversation:

- “Where are you from?”
- “What do you do?”
- “Do you live nearby?”

However, a conversation becomes more interesting when you gently ask about the person’s experiences, feelings, or preferences.

Instead of only asking:

> “What do you do for work?”

You could continue with:

> “What do you enjoy most about it?”

Instead of:

> “How long have you lived here?”

Try:

> “What do you like most about living here?”

Other useful questions include:

- “How did you become interested in that?”
- “What has been the best part of your week?”
- “What do you usually enjoy doing on weekends?”
- “What is something you are looking forward to?”
- “What kind of places do you like visiting?”

These questions are personal enough to create a connection, but still safe and appropriate for someone you have just met.

## Listen for the Kind of Conversation They Want

People do not always want the same thing from a conversation. They may want to:

1. Exchange information or make a decision.
2. Share an emotion or experience.
3. Talk about their interests, identity, or relationships.

Try to respond to the kind of conversation the other person has started.

If someone says:

> “I moved here two weeks ago and everything still feels unfamiliar.”

A purely practical response might be:

> “You should download a city guide.”

But an emotional response may connect better:

> “That sounds exciting, but probably a little overwhelming too. How has it been so far?”

You do not always need to solve a problem. Sometimes people simply want to feel understood.

## Show That You Are Really Listening

A useful technique is to:

1. Ask a question.
2. Listen carefully.
3. Summarize the important part in your own words.
4. Check whether you understood correctly.

For example:

> “So you started learning photography because you wanted a creative hobby outside work. Did I understand that correctly?”

You do not need to do this formally after every answer. Short natural responses also work:

- “So that is what brought you here.”
- “It sounds like you really enjoyed it.”
- “I can see why that was frustrating.”
- “So you prefer quieter places?”
- “That makes sense.”

These responses show that you are not simply waiting for your turn to speak.

## Share Something About Yourself Too

Good small talk should not feel like an interview. After asking a question, share a related detail about yourself.

For example:

> “What kind of music do you listen to? I’ve been listening to a lot of jazz recently, but I’m trying to discover something new.”

Or:

> “Have you travelled anywhere interesting recently? I visited a small town by a lake last weekend and really enjoyed it.”

A useful pattern is:

**Ask → Listen → Respond → Share → Ask again**

This creates a balanced conversation in which both people gradually reveal more about themselves.

## How to Keep the Conversation Going

Listen for a detail you can explore.

If the person says:

> “I recently started running.”

You could ask:

- “What made you start?”
- “Do you prefer running alone or with other people?”
- “Was it difficult in the beginning?”
- “Are you training for anything?”

You do not need to introduce a completely new topic after every answer. Often, the easiest way to continue is to become curious about one detail the person has already mentioned.

## What to Avoid

Try not to:

- Ask many unrelated questions one after another.
- Turn every answer back to yourself.
- Give advice before understanding what the person needs.
- Ask questions that are too personal too quickly.
- Pretend to understand when you are confused.
- Focus so much on perfect grammar that you stop listening.

It is completely natural to pause, search for a word, or ask someone to repeat themselves.

Useful phrases include:

- “Sorry, could you say that again?”
- “What do you mean by that?”
- “I’m not sure I understood correctly.”
- “How would you describe it?”
- “Give me a second—I’m trying to find the right word.”

## How to End the Conversation Politely

Not every conversation needs to last a long time. You can finish warmly without making the moment awkward:

- “It was really nice talking to you.”
- “I’m going to get another drink, but I’m glad we met.”
- “I’ll let you talk to the others, but I enjoyed our conversation.”
- “I hope you enjoy the rest of the event.”
- “Maybe I’ll see you again later.”

Ending a conversation politely is also an important communication skill.

## A Simple Conversation Formula

When you are unsure what to do, remember:

1. **Open:** Comment on the shared situation.
2. **Explore:** Ask about an experience, preference, or feeling.
3. **Listen:** Respond to something specific they said.
4. **Connect:** Share a related detail about yourself.
5. **Continue or close:** Ask a follow-up question or end politely.

## Practice Scenario

In this roleplay, you are meeting a friendly stranger at a social event. Start with an easy question, listen for interesting details, and gradually move from basic facts to experiences and interests.

Try to practice at least three skills:

- Ask one question about an experience or feeling.
- Refer to something the stranger said earlier.
- Share something related about yourself.

Do not worry about creating a perfect conversation. Concentrate on being curious, attentive, and easy to talk to.`),
  category: { categoryTitle: i18n._('Social'), categoryId: 'social' },
  input: [],

  subTitle: i18n._('Develop your conversational skills with casual small talk'),
  instructionToAi: `You are a friendly stranger meeting the user at a social event.

Have a natural, relaxed conversation suitable for a language learner. Begin with light small talk about the event or shared surroundings.

During the conversation:
- Share realistic details about yourself so the conversation does not feel like an interview.
- Give the user opportunities to ask follow-up questions.
- Occasionally mention an experience, feeling, hobby, or preference that the user can explore.
- Respond warmly when the user shows curiosity or refers to something you said earlier.
- Match the user's conversational style and language level.
- Do not dominate the conversation or ask several questions at once.
- Do not correct every language mistake during the roleplay.
- If the conversation reaches a natural ending, allow the user to practice closing it politely.`,
  exampleOfFirstMessageFromAi:
    "Hey there, I'm Fable. This is my first time at an event like this. How about you? Enjoying yourself so far?",
  illustrationDescription:
    'Two people casually chatting at a coffee shop or park, both smiling and engaged in friendly conversation, while others are in the background enjoying the atmosphere.',
  imageSrc: '/role/c916a0f2-59d4-4d45-99c3-dda8a714cd6c.webp',
  videoSrc: '/role/c916a0f2-59d4-4d45-99c3-dda8a714cd6c_1.mp4',
  voice: 'marin',
});
