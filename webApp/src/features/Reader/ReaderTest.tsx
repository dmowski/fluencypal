'use client';

import { Stack } from '@mui/material';
import { Reader } from './Reader';
import { ReaderData } from './types';

export const ReaderTest = () => {
  const data: ReaderData = {
    title: 'Supercommunicators',
    subtitle: 'How to Unlock the Secret Language of Connection',
    category: 'Charles Duhigg',
    content: `Who would you call if you were having a bad day? If you had screwed up a deal at work, or had gotten into an argument with your spouse, or were feeling frustrated and sick of it all: Who would you want to talk to? There’s likely someone that you know who will make you feel better, who can help you think through a thorny question or share a moment of heartbreak or joy.
Now, ask yourself: Are they the funniest person in your life? (Probably not, but if you paid close attention, you’d notice they laugh more than most people.) Are they the most interesting or smartest person you know? (What’s more likely is that, even if they don’t say anything particularly wise, you anticipate that you will feel smarter after talking to them.) Are they your most entertaining or confident friend? Do they give the best advice? (Most likely: Nope, nope, and nope—but when you hang up the phone, you’ll feel calmer and more centered and closer to the right choice.)
So what are they doing that makes you feel so good?

This book attempts to answer that question. Over the past two decades, a body of research has emerged that sheds light on why some of our conversations go so well, while others are so miserable. These insights can help us hear more clearly and speak more engagingly. We know that our brains have evolved to crave connection: When we “click” with someone, our eyes often start to dilate in tandem; our pulses match; we feel the same emotions and start to complete each other’s sentences within our heads. This is known as neural entrainment, and it feels wonderful. Sometimes it happens and we have no idea why; we just feel lucky that the conversation went so well. Other times, even when we’re desperate to bond with someone, we fail again and again.

For many of us, conversations can sometimes seem bewildering, stressful, even terrifying. “The single biggest problem with communication,” said the playwright George Bernard Shaw, “is the illusion it has taken place.” But scientists have now unraveled many of the secrets of how successful conversations happen. They’ve learned that paying attention to someone’s body, alongside their voice, helps us hear them better. They have determined that how we ask a question sometimes matters more than what we ask. We’re better off, it seems, acknowledging social differences, rather than pretending they don’t exist. Every discussion is influenced by emotions, no matter how rational the topic at hand. When starting a dialogue, it helps to think of the discussion as a negotiation where the prize is figuring out what everyone wants.

And, above all, the most important goal of any conversation is to connect.

-

This book was born, in part, from my own failures at communicating. A few years ago, I was asked to help manage a relatively complex work project. I had never been a manager before—but I had worked for plenty of bosses. Plus, I had a fancy MBA from Harvard Business School and, as a journalist, communicated as a profession! How hard could it be?

Very hard, it turned out. I was fine at drawing up schedules and planning logistics. But, time and again, I struggled with connecting. One day a colleague told me they felt their suggestions were being ignored, their contributions going unrecognized. “It’s incredibly frustrating,” they said.

I told them that I heard them and began suggesting possible solutions: Perhaps they should run the meetings? Or maybe we should draw up a formal organizational chart, clearly spelling out everyone’s duties? Or what if we—

You’re not listening to me,” they interrupted. “We don’t need clearer roles. We need to do a better job of respecting each other.” They wanted to talk about how people were treating one another, but I was obsessed with practical fixes. They had told me they needed empathy, but rather than listen, I replied with solutions.
The truth is, a similar dynamic sometimes played out at home. My family would go on vacation, and I would find something to obsess over—we didn’t get the hotel room we were promised; the guy on the airplane had reclined his seat—and my wife would listen and respond with a perfectly reasonable suggestion: Why don’t you focus on the positive aspects of the trip? Then I, in turn, would get upset because it felt like she didn’t understand that I was asking for support—tell me I’m right to be outraged!—rather than sensible advice. Sometimes my kids would want to talk and I, consumed by work or some other distraction, would only half listen until they wandered away. I could see, in retrospect, that I was failing the people who were most important to me, but I didn’t know how to fix it. I was particularly confused by these failures because, as a writer, I am supposed to communicate for a living. Why was I struggling to connect with—and hear—the people who mattered most?

I have a feeling I’m not alone in this confusion. We’ve all failed, at times, to listen to our friends and colleagues, to appreciate what they are trying to tell us—to hear what they’re saying. And we’ve all failed to speak so we can be understood.

This book, then, is an attempt to explain why communication goes awry and what we can do to make it better. At its core are a handful of key ideas.

The first one is that many discussions are actually three different conversations. There are practical, decision-making conversations that focus on What’s This Really About? There are emotional conversations, which ask How Do We Feel? And there are social conversations that explore Who Are We?

We are often moving in and out of all three conversations as a dialogue unfolds. However, if we aren’t having the same kind of conversation as our partners, at the same moment, we’re unlikely to connect with each other.

What’s more, each type of conversation operates by its own logic and requires its own set of skills, and so to communicate well, we have to know how to detect which kind of conversation is occurring, and understand how it functions.

Which brings me to the second idea at the core of this book: Our goal, for the most meaningful discussions, should be to have a “learning conversation.” Specifically, we want to learn how the people around us see the world and help them understand our perspectives in turn.

The last big idea isn’t really an idea, but rather something I’ve learned: Anyone can become a supercommunicator—and, in fact, many of us already are, if we learn to unlock our instincts. We can all learn to hear more clearly, to connect on a deeper level. In the pages ahead, you’ll see how executives at Netflix, the creators of The Big Bang Theory, spies and surgeons, NASA psychologists and COVID researchers have transformed how they speak and listen—and, as a result, have managed to connect with people across seemingly vast divides. And you will see how these lessons apply to everyday conversations: our chats with workmates, friends, romantic partners and our kids, the barista at the coffee shop and that woman we always wave to on the bus.

And that’s important, because learning to have meaningful conversations is, in some ways, more urgent than ever before. It’s no secret the world has become increasingly polarized, that we struggle to hear and be heard. But if we know how to sit down together, listen to each other and, even if we can’t resolve every disagreement, find ways to hear one another and say what is needed, we can coexist and thrive.

Every meaningful conversation is made up of countless small choices. There are fleeting moments when the right question, or a vulnerable admission, or an empathetic word can completely change a dialogue. A silent laugh, a barely audible sigh, a friendly smile during a tense moment: Some people have learned to spot these opportunities, to detect what kind of discussion is occurring, to understand what others really want. They have learned how to hear what’s unsaid and speak so others want to listen.

This, then, is a book that explores how we communicate and connect. Because the right conversation, at the right moment, can change everything.
`,
  };

  return (
    <Stack
      sx={{
        padding: '0',
        alignItems: 'center',
        height: '100%',
        flex: '1 1 1',
        backgroundColor: '#F4E1C6',
      }}
    >
      <Stack
        sx={{
          minHeight: '500px',
          flex: '1 1 1',
          width: '100%',
        }}
      >
        <Reader data={data} />
      </Stack>
    </Stack>
  );
};
