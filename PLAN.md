# Live document with ideas

General strategy:

⭐️ Build trust. If you have thoughts, write it, post it. Once you have 10 posts, share link on FluencyPal page. Twitter/Instagram/Threads/SubStuck/YouTube/TikTok

# Plan

## Create a separate feature

Create a separate Conversation mode with separate per hour billing

https://developers.openai.com/api/docs/models/gpt-live-1

Price per minute = $0.05

### Idea

I want to create a separate experimental module for conversation.
By using gpt-live-1.

We Need to isolate it and may or may not reuse existing component.
Because current model of conversation relies on Open ai Realtime, and it might not be compatible with new approach.

So, I want to add a new card with separate payments and balance and functionality. For enhanced user experience.

I see it as card where user can see that it's experimental.
See their balance. button to start conversation.

For simplicity, use USD balance, but on UI show both USD and local currency if it's not USD.

### How to calculate price

GPT-Live 1 = $0.05/minute of active session time.

But, I want to add my margin. let's say 50%.
So to user it will be $0.1 per minute.

For user, show price per hour: $6

### Welcome balance

By default, user has $1 as trial balance. Create endpoint and client side checker that add that specific balance.

### How to calculate usage

When session is active, calculate time spend. And increment usage (or decriment). When no money on balance, stop session and show paywall.

Use separate user's level collection/document for that type of balance.

### How to store prices, profit

Use usd on database balance. add my 50% profit margin.

So, we will keep margin is private const, and outside system should have only final price per minute.

### File structure

Keep code inside webApp/src/features/OpenAiLive.
backend code as well. When you need to create endpoints, it should be tight
webApp/src/app/api/openAiLive/_ and call functions inside webApp/src/features/OpenAiLive/backend/_

### Integration with stripe

Update stripe WebHook to handle new payments.

### Feature flag

For the start, show that feature only for founder
webApp/src/features/Auth/useAuth.tsx isFounder
Just don't show that feature for anyone else.

### Where and how to display that card

For now, on dashboard, create a card with necessary controls:
Start conversation, Buy more, balance

### Prompt and user info

Check on how we integrate user info into conversation
webApp/src/features/Conversation/useAiConversation/useAiConversation.tsx

Create a few modes of conversation:
Just talk, grammar rules based on mistakes,

### Code integration

Check if we can reuse that module for conversation
webApp/src/features/Conversation/ConversationCanvas.tsx.
Maybe allow only "call mode", because new live mode does not support text messages. yeah, keep only call mode for simplicity.

Check if it's support save voices we use on the app.
If it's easier to create conversation UI from scratch, let's do that.

For now it's important to have:
Mute/Unmute button, see transcripts, close conversation, and hear AI response.

### E2E, UI, Screenshot tests tests

Do not write a lot of tests. Keep tests only for payment, price related features. and TS validation. Let's build MVP firstly, and refactor later.
