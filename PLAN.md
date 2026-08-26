# Live document with ideas

## Show trial notification/modal on page - one time with "ok"

Only for conversation with AI

webApp/src/features/Goal/Quiz/QuizPage2.tsx
webApp/src/features/Goal/Quiz/useQuiz.tsx
webApp/src/features/Price/price.ts

Add dynamic step with info about trial and prices

That step should include:
Price per month,
if TRIAL_DAYS is more than zero, show badge that user has one day trial access with full access.
And info that

## Redesign Daily questions/Chat - Foster community

- Show paywall blocker on daily chat cards and public.
  Check that messages in not marked as read when user does not have access

- Remove old messages after 4 days
  But not private DM messages
  Ensure firebase access rules check paid users

- Add onboarding daily task about Community
  - Message will be removed in 4 days
  - Be careful with words and calm, we all learners
  - Summarize what you heard, share support and ask a follow up question

- Weekly question: How are you? - Update daily question to repeat it
- Weekly question: Who are you?

## Main Issue

The biggest problem is how to return user. Engagements. People don't use it daily.
How they return to it - When we remember this. Ideal solution - is someone who can notify it.

Tech solution:
Sophisticated Daily Tasks that analyze you progress and propose what is good for you dynamically
