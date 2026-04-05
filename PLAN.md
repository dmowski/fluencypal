# Live document with short/long term ideas

## Emails

We are creating helper tool that speedup process of sending personal "Founder->User" emails

- Create admin panel section that helps with sending emails, call it "Emails"
  web/src/features/Analytics/AdminStats/AdminStats.tsx
  Like we did for "Open Story Creator"

- On this page, show last 20 sign-ups users (use firebase auth on backend).
  -- Create endpoint to return these users. Only found can get this data. Check web/src/app/api/loadStats/route.ts on how to limit access to
  -- create helper function and types like web/src/app/api/loadStats/loadStatsRequest.ts
  -- Along with email/id, add getUsersQuizSurvey(user.id)

- Near each user, show button "Send email"
  This button should redirect to gmail with filled title and content.

  Title: About the app
  Content: web/src/features/Email/welcomeEmail.ts

- When the admin, clicked on "Send email", save in localstorage that this user is "clicked" and show this button with type "text", so that I (admin), can understand that I already send the message

## Tune first quiz

## Learning plan: AI call

- Tune prompt for VAD call, to use Polish constantly
- Improve transcript timeout (make it less pressing)
- Validate costs of full goal conversation

## Essay writing helper
