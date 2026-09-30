# Live document with ideas

General strategy:

⭐️ Use app daily. ✅
⭐️ Build trust. If you have thoughts, write it, post it. Once you have 10 posts, share link on FluencyPal page. Twitter/Instagram/Threads/SubStuck/YouTube/TikTok

## Propose your Daily Question

Let's implement ability for users to create their own daily question.
webApp/src/features/Dashboard/DailyQuestionDashboardCard.tsx

Add button "Add my question", that will open a modal where user
can enter texts and it will be available for everyone to answer.

It todays user's question is exist, instead of "Add my question" button, show card with that question.

So, we will have 2 questions card on
webApp/src/features/Dashboard/DailyQuestionDashboardCard.tsx

As use I can remove my question or if I am founder, I can remove/edit others questions.

When new question is created, send tg notification.

Don't forget to update webApp/firestore.rules

Also show user's question on http://localhost:3000/?dailyQuestions=true. Order: todays question (system), today's users question, previous user's question, previous questions (system)
