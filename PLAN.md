# Live document with short/long term ideas

## Reader

- create provider, client side component;
  wrap: webApp/src/app/page.tsx

In url is "book.fluencypal.com", render
<ThemeProvider theme={lightTheme}>
<Suspense fallback={<div>Loading...</div>}>
<ReaderPage />
</Suspense>
</ThemeProvider>
otherwise, use child.
If you can do it on server side, it would be better.

- Setup PWA, different manifest for different project types

- Tune logic of Markdown page splitting. Use proper markdown component to render content to check if it's fit.
- Fix _long paragraph italic text on separate pages_
- Automatic re-import, create parser version

=================================

Reader info:
webApp/src/features/Reader/AGENTS.md

## Create component "Create Learning Plan"; to create it in the app

## Problem with quiz

- In just ask, and I don't see that I will get results

## Update Quiz. How to show user profit, wow moment, aha moment

- Mic access, and button "Start first call"
- How to show user's mistakes/improvements?
- How user feel improvements?

## How to improve VAD

## Hide "Cases" pages
