# Live document with short/long term ideas

## Add feature for assess language level

- Validate if content is in target language, on useProgressEvaluation

- Add hook to trigger analyzing user's content
  - Find places where to trigger. add comments // TODO: TriggerProgressAnalysis
    - web/src/features/Conversation/useAiConversation/useConversationStat.ts: on each talk mode
    - web/src/features/Chat/useChat.tsx: addMessage

- How to process historical data
  - Chats with AI
    - Create bg script (hook) that periodically check what's needed to process. Like 3 chats per session
  - Community activities: Daily questions, Private messages, global chats
    - Create bg script (hook) that periodically check what's needed to process. Like 3 chats per session

- Full size report
  - On Dashboard card show full data
  - Show Summary
  - Use ai to generate proposal on how to correct practice

---

## Emails

After Sign Up: send welcome email. With idea behind project. Not "beautiful" templates. Just write as you feel. Provide strategy of learning.

Structure: About me, Goal of the project, Strategies of work with the project, how to contribute to the idea of the project

Plan:

- Create email in .md file
- Update Admin page with generate links of recent sign up. and generate links for create emails with placeholders.
- When I clicked on email, mark link as clicked

## Learning plan: AI call

- Tune prompt for language consistence (so it uses Polish along the way)
- Improve transcript timeout (make it less pressing)
- Validate costs of full goal conversation
