'use client';

import { useMemo } from 'react';
import { useLingui } from '@lingui/react';
import { I18n } from '@lingui/core';
import { DailyTaskType, DayTasksMeta } from '@/features/Tasks/types';

export const DAILY_PLAN_COUNT = 200;

/** Rotating task sets. Excludes news. grammar-improvement is always last when included. */
const TASK_CYCLES: DailyTaskType[][] = [
  ['just-talk', 'goal-lesson'],
  ['just-talk'],
  ['just-talk', 'goal-lesson'],
  ['just-talk', 'story'],
  ['just-talk', 'goal-lesson', 'grammar-improvement'],
  ['just-talk', 'daily-question'],
  ['just-talk', 'community'],
  ['just-talk', 'goal-lesson'],
  ['just-talk', 'grammar-improvement'],
  ['just-talk', 'goal-lesson', 'community'],
];

function buildEarlyPlans(i18n: I18n): DayTasksMeta[] {
  return [
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Build a steady learning habit'),
      subTitle: i18n._('Start with today’s tasks and keep a gentle pace.'),
    },
    {
      tasks: ['just-talk'],
      title: i18n._('Day two: keep going'),
      subTitle: i18n._('Continue with today’s tasks and stay consistent.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day three: steady progress'),
      subTitle: i18n._('You’re doing well. Take a look at today’s tasks.'),
    },
    {
      tasks: ['just-talk'],
      title: i18n._('Day four: keep the habit alive'),
      subTitle: i18n._(
        'Consistency is key to language learning. Complete today’s tasks to keep the habit alive.',
      ),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day five: keep the rhythm'),
      subTitle: i18n._('You’re in a good flow. Continue with today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Strong consistency'),
      subTitle: i18n._('Your consistency is paying off. Here are today’s tasks.'),
    },
    {
      tasks: ['just-talk'],
      title: i18n._('Day seven: one full week'),
      subTitle: i18n._('Nice work reaching a full week. Let’s continue with today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day eight: keep moving forward'),
      subTitle: i18n._('Many people stop early, but you are still here. Be proud of that.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Today’s tasks'),
      subTitle: i18n._('A calm routine makes steady progress.'),
    },
    {
      tasks: ['just-talk'],
      title: i18n._('Day ten: a solid start'),
      subTitle: i18n._('Ten active days already. Keep the momentum with today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day eleven: stay curious'),
      subTitle: i18n._('Curiosity keeps learning fun. Explore today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'story'],
      title: i18n._('Day twelve: mix it up'),
      subTitle: i18n._('A little variety helps you grow. Here’s what to do today.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day thirteen: keep showing up'),
      subTitle: i18n._('Showing up is half the work. Complete today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'daily-question'],
      title: i18n._('Day fourteen: two weeks in'),
      subTitle: i18n._('Two weeks of practice — that’s real progress. Keep going.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day fifteen: halfway to a month'),
      subTitle: i18n._('You’re building something lasting. Take on today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'story'],
      title: i18n._('Day sixteen: stay engaged'),
      subTitle: i18n._('Engagement turns practice into fluency. Try today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day seventeen: quiet progress'),
      subTitle: i18n._('Progress isn’t always loud. Small steps still count today.'),
    },
    {
      tasks: ['just-talk', 'grammar-improvement'],
      title: i18n._('Day eighteen: sharpen your skills'),
      subTitle: i18n._('A focused day helps you improve. Here are today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day nineteen: almost three weeks'),
      subTitle: i18n._('You’re close to three weeks. Finish today’s tasks strong.'),
    },
    {
      tasks: ['just-talk', 'community'],
      title: i18n._('Day twenty: three weeks strong'),
      subTitle: i18n._('Three weeks of learning — celebrate that and keep going.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day twenty-one: keep the streak'),
      subTitle: i18n._('Your streak is a sign of commitment. Continue with today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'story'],
      title: i18n._('Day twenty-two: enjoy the process'),
      subTitle: i18n._('Enjoyment makes habits stick. Dive into today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day twenty-three: steady as ever'),
      subTitle: i18n._('Steady practice compounds. Here’s what to focus on today.'),
    },
    {
      tasks: ['just-talk', 'daily-question'],
      title: i18n._('Day twenty-four: stay present'),
      subTitle: i18n._('One day at a time is enough. Complete today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day twenty-five: almost a month'),
      subTitle: i18n._('A month of learning is within reach. Keep going today.'),
    },
    {
      tasks: ['just-talk', 'community'],
      title: i18n._('Day twenty-six: stay sharp'),
      subTitle: i18n._('Stay sharp with a fresh set of tasks for today.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day twenty-seven: keep the habit'),
      subTitle: i18n._('Habits are built one day at a time. Here’s today’s plan.'),
    },
    {
      tasks: ['just-talk', 'grammar-improvement'],
      title: i18n._('Day twenty-eight: four weeks in'),
      subTitle: i18n._('Four weeks of practice — that’s something to be proud of.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day twenty-nine: nearly there'),
      subTitle: i18n._('You’re nearly at a full month. Finish today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson', 'community'],
      title: i18n._('Day thirty: one full month'),
      subTitle: i18n._('A full month of learning. Remarkable — let’s keep going.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day thirty-one: a new chapter'),
      subTitle: i18n._('Month two begins. Start it well with today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'story'],
      title: i18n._('Day thirty-two: keep exploring'),
      subTitle: i18n._('Exploration keeps learning alive. Try today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day thirty-three: trust the process'),
      subTitle: i18n._('Trust the process. Small daily steps add up.'),
    },
    {
      tasks: ['just-talk', 'daily-question'],
      title: i18n._('Day thirty-four: stay consistent'),
      subTitle: i18n._('Consistency beats intensity. Continue with today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day thirty-five: five weeks strong'),
      subTitle: i18n._('Five weeks of showing up. Keep that energy going today.'),
    },
    {
      tasks: ['just-talk', 'story'],
      title: i18n._('Day thirty-six: stay connected'),
      subTitle: i18n._('Stay connected to your goals. Here are today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day thirty-seven: gentle progress'),
      subTitle: i18n._('Gentle progress still moves you forward. Try today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'grammar-improvement'],
      title: i18n._('Day thirty-eight: refine your voice'),
      subTitle: i18n._('Refining your skills takes time. Focus on today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day thirty-nine: keep climbing'),
      subTitle: i18n._('You’re still climbing. Take the next step with today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'community', 'story'],
      title: i18n._('Day forty: a big milestone'),
      subTitle: i18n._('Forty active days — that’s dedication. Keep the habit alive.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day forty-one: beyond forty'),
      subTitle: i18n._('You’re past forty days. Continue with calm, steady practice.'),
    },
    {
      tasks: ['just-talk', 'story'],
      title: i18n._('Day forty-two: six weeks in'),
      subTitle: i18n._('Six weeks of learning. Be proud and keep going today.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day forty-three: stay the course'),
      subTitle: i18n._('Staying the course is rare. Here’s what to do today.'),
    },
    {
      tasks: ['just-talk', 'daily-question'],
      title: i18n._('Day forty-four: keep it light'),
      subTitle: i18n._('A light day still counts. Complete today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day forty-five: almost seven weeks'),
      subTitle: i18n._('You’re almost at seven weeks. Finish today’s tasks strong.'),
    },
    {
      tasks: ['just-talk', 'community'],
      title: i18n._('Day forty-six: stay motivated'),
      subTitle: i18n._('Motivation comes and goes — habits carry you. Try today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson'],
      title: i18n._('Day forty-seven: keep practicing'),
      subTitle: i18n._('Practice turns effort into skill. Here are today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'grammar-improvement'],
      title: i18n._('Day forty-eight: polish and practice'),
      subTitle: i18n._('A bit of polish goes a long way. Focus on today’s tasks.'),
    },
    {
      tasks: ['just-talk', 'goal-lesson', 'community'],
      title: i18n._('Day forty-nine: seven weeks strong'),
      subTitle: i18n._('Seven weeks of learning. Remarkable consistency — keep going.'),
    },
  ];
}

function milestonePlan(i18n: I18n, day: number): DayTasksMeta | null {
  const milestones: Record<number, DayTasksMeta> = {
    50: {
      tasks: ['just-talk', 'goal-lesson', 'grammar-improvement'],
      title: i18n._('Day 50: fifty days strong'),
      subTitle: i18n._('Fifty active days — a real habit. Celebrate and keep going.'),
    },
    60: {
      tasks: ['just-talk', 'goal-lesson', 'community'],
      title: i18n._('Day 60: two months in'),
      subTitle: i18n._('Two months of practice. That’s rare dedication — keep it up.'),
    },
    70: {
      tasks: ['just-talk', 'goal-lesson', 'daily-question', 'grammar-improvement'],
      title: i18n._('Day 70: keep climbing'),
      subTitle: i18n._('Seventy days of showing up. Take today’s tasks with pride.'),
    },
    75: {
      tasks: ['just-talk', 'community'],
      title: i18n._('Day 75: past the halfway mark to 150'),
      subTitle: i18n._('You’re building something lasting. Continue with today’s tasks.'),
    },
    80: {
      tasks: ['just-talk', 'goal-lesson', 'grammar-improvement'],
      title: i18n._('Day 80: eighty days of progress'),
      subTitle: i18n._('Eighty days in — your consistency is paying off.'),
    },
    90: {
      tasks: ['just-talk', 'goal-lesson', 'community'],
      title: i18n._('Day 90: three months strong'),
      subTitle: i18n._('Three months of learning. Remarkable — let’s keep going.'),
    },
    100: {
      tasks: ['just-talk', 'goal-lesson', 'community', 'grammar-improvement'],
      title: i18n._('Day 100: one hundred days'),
      subTitle: i18n._('One hundred active days. An incredible milestone — keep going.'),
    },
    120: {
      tasks: ['just-talk', 'goal-lesson', 'daily-question'],
      title: i18n._('Day 120: four months in'),
      subTitle: i18n._('Four months of practice. Stay calm and keep the habit alive.'),
    },
    150: {
      tasks: ['just-talk', 'goal-lesson', 'community', 'grammar-improvement'],
      title: i18n._('Day 150: one hundred fifty days'),
      subTitle: i18n._('One hundred fifty days of learning. Be proud of how far you’ve come.'),
    },
    180: {
      tasks: ['just-talk', 'goal-lesson', 'community'],
      title: i18n._('Day 180: six months strong'),
      subTitle: i18n._('Six months of showing up. That’s a true learning habit.'),
    },
    200: {
      tasks: ['just-talk', 'goal-lesson', 'community', 'daily-question', 'grammar-improvement'],
      title: i18n._('Day 200: two hundred days'),
      subTitle: i18n._('Two hundred active days. Extraordinary consistency — keep going.'),
    },
  };

  return milestones[day] ?? null;
}

function generatedPlan(i18n: I18n, day: number): DayTasksMeta {
  const titleTemplates = [
    (d: number) => i18n._('Day {day}: keep going', { day: d }),
    (d: number) => i18n._('Day {day}: stay consistent', { day: d }),
    (d: number) => i18n._('Day {day}: steady progress', { day: d }),
    (d: number) => i18n._('Day {day}: keep the habit', { day: d }),
    (d: number) => i18n._('Day {day}: keep practicing', { day: d }),
    (d: number) => i18n._('Day {day}: stay sharp', { day: d }),
    (d: number) => i18n._('Day {day}: keep climbing', { day: d }),
    (d: number) => i18n._('Day {day}: gentle progress', { day: d }),
  ];

  const subTitleTemplates = [
    i18n._('Continue with today’s tasks and stay consistent.'),
    i18n._('Small steps still count. Here are today’s tasks.'),
    i18n._('A calm routine makes steady progress.'),
    i18n._('Showing up is half the work. Complete today’s tasks.'),
    i18n._('Your consistency is paying off. Try today’s tasks.'),
    i18n._('Keep a gentle pace and finish today’s tasks.'),
    i18n._('Stay present and take on today’s tasks.'),
    i18n._('Practice turns effort into skill. Here’s today’s plan.'),
  ];

  const index = day - 1;
  return {
    tasks: TASK_CYCLES[index % TASK_CYCLES.length],
    title: titleTemplates[index % titleTemplates.length](day),
    subTitle: subTitleTemplates[index % subTitleTemplates.length],
  };
}

export function buildDailyPlans(i18n: I18n): DayTasksMeta[] {
  const earlyPlans = buildEarlyPlans(i18n);
  const plans: DayTasksMeta[] = [];

  for (let day = 1; day <= DAILY_PLAN_COUNT; day++) {
    const early = earlyPlans[day - 1];
    if (early) {
      plans.push(early);
      continue;
    }

    const milestone = milestonePlan(i18n, day);
    plans.push(milestone ?? generatedPlan(i18n, day));
  }

  return plans;
}

export function useDailyPlans(): DayTasksMeta[] {
  const { i18n } = useLingui();
  return useMemo(() => buildDailyPlans(i18n), [i18n]);
}
