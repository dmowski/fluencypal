# Live document with short/long term ideas

## News: They should be interesting for me.

webApp/src/features/News/AGENTS.md

- Add ability to change complexity inside newsModal
- Pause voiceover when translation modal is open and resume when it hidden

## On Blog, start sharing post about how fluency pas is being created

++++++++++++++++++++++++

## Goal:

I want to create dynamic blog post editor.
That editor should be placed on admin panel.
And expose API (public access) to get blog data. Later it will be used on landing page.
On admin panel I should see list of blog post and option to edit it and publish, and automatically translate to all supported language.
webApp/src/features/Lang/lang.ts

We already have story editor, webApp/src/features/Analytics/AdminStats/StoryCreator/StoryEditorModal.tsx
Story is another feature, but you can take example from it.

## Automation translation:

On blog post, we should be able to see "Languages" dropdown to navigate across languages.
On UI we should see buttons "Translate to this language" (use EN as and source of truth) and "Translate to all languages".
You will use AI to generate these translation.
Example of using ai: webApp/src/features/Analytics/AdminStats/StoryCreator/StoryEditorModal.tsx

## How to handle version

On firebase collection 'blogs', each document will have metadata, like:
id,
publishedVersion (id),
updatedAtIso: string,
createdAtIso:string,
publishedAtIso: string.

And subconnection for each document. called "versions"

On version we will have localized data:
{
imagePreviewUrl: string,
categoryId: string,
content: Record<SupportedLanguage, string>
title: Record<SupportedLanguage, string>
subTitle: Record<SupportedLanguage, string>
keywords: Record<SupportedLanguage, string[]>
}

## Firebase rules:

Explicitly add rule webApp/firestore.rules for collection "blogs"

## Test coverage:

Use only typescript "pnpm lint" to validate changes

## Architecture:

Create a new feature folder called webApp/src/features/Blog
And place all code here. api endpoint should be tiny calls of service side modules placed in webApp/src/features/Blog
Create AGENTS.md inside that folder.
Create types.ts with related TS files
Create backend folder to keep backend related code.

## Data structure:

Your interface with blog data, show contain all these data from static blog post. and expand if if needed.
landing/src/features/Blog/blogData.tsx

### Data Base:

On editor use firebase directly. take example from webApp/src/features/Analytics/AdminStats/StoryCreator/StoryAdmin.tsx

### Editor:

Use rich text editor for edit blog.
webApp/src/features/Chat/RichTextEditor.tsx
And create tab for preview.
Preview should mirror real blog MD view
<Markdown variant="blog">{`${item.content}`}</Markdown>
landing/src/features/Blog/BlogOnePage.tsx
If variant="blog" is missed on webApp, copy that style.

### Version control:

On database we should be able to keep all changes for history.

### View on admin panel:

On admin panel we have tabs "Open Story Creator", "Email", create new tab/button "Blog"

### What not to do right now:

- Do not integrate with landing blog (UI).
- Do not integrate with source map generation

### Old blog post:

Old (Static) blog post will continue exists. At least for now. So we will have 2 types of blog data. Dynamic and Static.
Most probably we will just expand getBlogs function by adding call of api (But we will do it later)
landing/src/features/Blog/blogData.tsx

### Integration on landing (Next step, plan. Do not do it right now.):

- Use URL of API app.fluencypal.com/getBlogs, app.fluencypal.com/getBlog(id) to add dynamic blogs into existing (static) blogs.

### Files for context:

webApp/src/features/Analytics/AdminStats/AdminStats.tsx
webApp/AGENTS.md
landing/src/features/Blog/blogData.tsx

After finishing implementation, give me summary and places worth to carefully review.

++++++++++++++++++++++++

Make it easy to post many posts.
Use firebase, and expose "app" api to extract post info.
Create admin page with block creation.

- Test coverage
- Working with google calendar
- Working with AI prompt
- Working with Tasks

## Reader: Search feature

Reader info: webApp/src/features/Reader/AGENTS.md

## Alias game: create better version

- Write proper e2e tests.
- Add anonymized analytics
- Create separate landing page
- PWA for it?
- Ad for ai english
- Analytics on landing page

## App: Community call

## Microphone access: Instruction on fail

## Microphone access: On first start

## App: More realistic web calls

- How to setup custom realtime communicator

=================================

## Approve to use the app (Community)

## SEO, GEO

- Hide "Cases" pages
- Alias: remove from landing page
  To make domain more focused? Move to a separate landing?

Privacy and Security/ Two-Step Verification / Forget password>? / Having trouble accessing your email?
