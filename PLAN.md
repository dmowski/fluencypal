# Live document with short/long term ideas

## Reader: Converted pdf to Epub. Think about Kindl approach.

We need to integrate converter of user's input files.
For now we support only EPUB. And don't require auth for do that.

With new approach we will allow the user to upload PDF and Microsoft Docs files.

But if it's not epub, we will require auth. Show user auth modal. With mentions that for open "Pdf" you need to logging.

Then, on client, we need to upload that "pdf/word/etc" file to storage (on client), and pass this link to endpoint (converter).

That converting endpoint, should get link to firebase storage, load file, upload it to "cloudconvert", get converted file (wait until end), upload to our firestore storage and return epub link to end user.
Then continue our existing flow of processing epub.

Libs for doing convertation (I already create api key and installed lib): webApp/src/app/api/reader/convert/converter.ts

Reader info: webApp/src/features/Reader/AGENTS.md

- Integrate cloudconvert. (https://cloudconvert.com/), convert none epub to epub and keep origin file

- When none epub, ask auth

- Sony - reader. Epub. Word document to read it.
  Think about buy readers, real physical. Can we connect it with books.fluencypal.com.
  Download as "Epub",

- How to download file in kindl. You can send book to email. Without auth.

Sony digital readers.

## Reader: List. unable to highlight text

## Reader: Automatic re-import, create parser version

## Reader: Highlights - On hover, show full paragraph as preview

## Reader: Sync data. Review how it works

## Social network: Attach my voice records. Tune UI for messages

## News: Tune quality. News should be useful for me.

## News: community discussion

Think about community discussion. Can we place comments section under the news?
How to show previous news. Separate news cards?

## Reader: Search feature

## Reader:Fix _long paragraph italic text on separate pages_

=================================

Reader info: webApp/src/features/Reader/AGENTS.md

=================================

## Create component "Create Learning Plan"; to create it in the app

## Problem with quiz

In just ask, and I don't see that I will get results

## Update Quiz. How to show user profit, wow moment, aha moment

- Mic access, and button "Start first call"
- How to show user's mistakes/improvements?
- How user feel improvements?

## How to improve VAD

## Hide "Cases" pages
