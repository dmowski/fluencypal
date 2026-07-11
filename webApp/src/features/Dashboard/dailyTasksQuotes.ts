import type { I18n } from '@lingui/core';

export const getDailyTasksQuotes = (i18n: I18n): string[] => [
  i18n._('A journey of a thousand miles begins with a single step.'),
  i18n._('The only way to do great work is to love what you do.'),
  i18n._('It does not matter how slowly you go as long as you do not stop.'),
  i18n._('Success is not final, failure is not fatal: it is the courage to continue that counts.'),
  i18n._('Believe you can and you are halfway there.'),
  i18n._('The future belongs to those who believe in the beauty of their dreams.'),
  i18n._('You miss one hundred percent of the shots you do not take.'),
  i18n._('Start where you are. Use what you have. Do what you can.'),
  i18n._('The expert in anything was once a beginner.'),
  i18n._('Learning never exhausts the mind.'),
  i18n._('Live as if you were to die tomorrow. Learn as if you were to live forever.'),
  i18n._('Education is the most powerful weapon which you can use to change the world.'),
  i18n._(
    'The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.',
  ),
  i18n._('Tell me and I forget. Teach me and I remember. Involve me and I learn.'),
  i18n._('The beautiful thing about learning is that nobody can take it away from you.'),
  i18n._('Success is the sum of small efforts repeated day in and day out.'),
  i18n._('We are what we repeatedly do. Excellence, then, is not an act but a habit.'),
  i18n._('Do not watch the clock; do what it does. Keep going.'),
  i18n._('The secret of getting ahead is getting started.'),
  i18n._('You do not have to be great to start, but you have to start to be great.'),
  i18n._('Practice makes progress.'),
  i18n._('A little progress each day adds up to big results.'),
  i18n._('Rome was not built in a day.'),
  i18n._('Every accomplishment starts with the decision to try.'),
  i18n._('The harder you work for something, the greater you will feel when you achieve it.'),
  i18n._('Dream big. Start small. Act now.'),
  i18n._('Mistakes are proof that you are trying.'),
  i18n._('Strive for progress, not perfection.'),
  i18n._('Small steps every day.'),
  i18n._('Fall seven times, stand up eight.'),
  i18n._('What we learn with pleasure we never forget.'),
  i18n._('The only impossible journey is the one you never begin.'),
  i18n._('Knowledge speaks, but wisdom listens.'),
  i18n._('Action is the foundational key to all success.'),
  i18n._('An investment in knowledge pays the best interest.'),
  i18n._('The more that you read, the more things you will know.'),
  i18n._('I have not failed. I have just found ten thousand ways that will not work.'),
  i18n._('Either you run the day, or the day runs you.'),
  i18n._('Your limitation is only your imagination.'),
  i18n._('Push yourself, because no one else is going to do it for you.'),
];

export const getHourlyDailyTasksQuote = (i18n: I18n, hour: number): string => {
  const quotes = getDailyTasksQuotes(i18n);
  const index = hour % quotes.length;
  return quotes[index];
};
