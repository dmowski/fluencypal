# Live document with short/long term ideas

## Realtime transcript

- Integrate it with interactive quiz
- How to calculate if recording is done
  -- Split transcript and sentence into words and check that all words are pronounced
  -- Render pronounced words with "**word**" formatting

- While recording, show red blinking dot
- Close previous transcript session after starting a new one

## Reading:

[ACTION_ITEM] Try old transcription mode to get transcription

To start practice grammar improvement you need to fill:

- [x] Interactive quiz (Done)
- [ ] Then record sentence correctly

What I really want from reading?

: Guided support about what I am saying.

How to achieve that? From UX prospective?

: I am reading text and see what is good and what is wrong. So when something is wrong, I can repeat the phrase, maybe several times, and improve my pronunciation.

For example sentences. Firstly, I hear example. Than I start repeating. I am telling one word, and see the system feedback.
For example active word highlighted with green. If it's correct. Or red.

If green: I just continue reading

If red: I can repeat until I do it correctly.
Options: Play word/phrase (by pressing on button or automatically)

Questions - how to understand that it is really correct?
For MVP it's enough that AI understand the phrase correctly

How to achieve that "Guided support", can we use old mechanism for record voice?

[ACTION_ITEM] Need to dive deeper into realtime api for transcript.
How to do that?
Create a simple hook and make connection with RTC.

### How to do that?

- [ ] MVP. Just use recorder that we do for all recording and compare strings
- [ ] Use Realtime transcriber. But it might have downsides of quality

---

## Add notifications about mentions in global chat

Maybe combine all notification into one flow?

---

## Daily question

- [ ] Daily Tasks - Show image that is used for todays question

## Community

Validate messages with AI

- On message submit, run client side AI checker
  - If this message offensive, can be read for child
    - If no, add flag: warning: 'Might be offensive'
    - On UI show notification for user

- Add Legal Pages
  - Community Guidelines
  - AI Disclaimer

- Define Minimum Age
  - 16+ recommended
  - 13 minimum with consent

- Legal document: clarify Data Flows
  - Firebase
  - Stripe
  - OpenAI
  - Analytics

## Landing Page

Update first video landscape video

## Emails

After Sign Up: send welcome email

# Price

Re-think idea for price per hour

- (Validate) Keep collecting usage logs. Do not collect usage only if user is winner
- Payment modal: add more info for how long 1 hour is enough
  - Rename "Menu options"

- During buying hour, keep record in bd about price per hour
- (Validate) Ensure that if we buy hours with negative balance, we use zero as baseline

# Brainstorm ides

- Keep transcripts in localStorage?
- Keep userInfo in localStorage?
