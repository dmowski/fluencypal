export interface LandingReview {
  name: string;
  countryCode: string;
  reviewCountLabel: string;
  dateLabel: string;
  rating: number;
  title: string;
  body: string;
}

export const landingReviews: LandingReview[] = [
  {
    name: 'Alina Lachowska',
    countryCode: 'PL',
    reviewCountLabel: '1 review',
    dateLabel: '3 days ago',
    rating: 5,
    title: 'It helped me prepare for the Polish…',
    body: `It helped me prepare for the Polish language B2 exam, especially the speaking part. I like that after each task, it explains what I did wrong and how I can improve.

There are lots of useful features, and the app feels like it's constantly evolving and improving. It sometimes crashes, but the support is excellent. When I reported an issue and suggested adding more Polish B2 speaking exam variants, the problem was fixed and the new exam variants were added within a day.

I highly recommend it to anyone preparing for a language exam or aiming to be more confident in communication.`,
  },
  {
    name: 'Mikhail Zhuk',
    countryCode: 'BG',
    reviewCountLabel: '2 reviews',
    dateLabel: '5 days ago',
    rating: 5,
    title: 'Great app',
    body: `Great app! I can practice my English speaking, get help whenever I get stuck, and never feel rushed. I also like the exam preparation and the personalized grammar feedback based on my previous conversations.

The only issue I've noticed is with very long conversations. After a few hours, the app sometimes crashes, and the AI forgets what we talked about earlier. I hope this gets improved in future updates.

Overall, it's great app and excellent value for the price.`,
  },
  {
    name: 'Ngoc Nguyen',
    countryCode: 'DE',
    reviewCountLabel: '1 review',
    dateLabel: 'Jul 3, 2026',
    rating: 5,
    title: 'Highly recommended',
    body: `Highly recommended. You can make conversations with AI without any contact on the screen. I do it while doing household chores. You can spend your time effectively.`,
  },
];
