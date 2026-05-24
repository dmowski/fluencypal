# Live document with short/long term ideas

## Reader:

On render we have a problem with splitting paragraph into pages.
If paragraph has "normal text _long paragraph italic text_ and we need to render
"normal text _long paragraph italic" on first page, and "text_" on other, we see "\_" symbols on both size.

In this task we need to handle that case.
Reader info: webApp/src/features/Reader/AGENTS.md

This is challenging case, so we need to handle it step by step.

Firs of all create a new tab "Split"
webApp/src/features/Reader/components/DevPanel.tsx

that will provide option to test
webApp/src/features/Reader/utils/splitParagraphsIntoPages.tsx

in should provide option to write different text with static pages. and on each change of settings/text render these pages.
For we can manually test and see that bug.

Once you done with devPanel, wait for another instruction

## Microphone access: Instruction on fail

## Microphone access: On first start

## App: More realistic web calls

- How to setup custom realtime communicator

## App: Community call

## Reader: Share the book with others

Check how it works

## Approve to use the app (Community)

## Reader: Search feature

=================================

Reader info: webApp/src/features/Reader/AGENTS.md

=================================

## SEO, GEO

- Hide "Cases" pages
- Alias: remove from landing page
  To make domain more focused? Move to a separate landing?

Privacy and Security/ Two-Step Verification / Forget password>? / Having trouble accessing your email?
