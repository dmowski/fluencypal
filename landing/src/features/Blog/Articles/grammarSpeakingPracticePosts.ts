import { getI18nInstance } from '@/appRouterI18n';
import { SupportedLanguage } from '@/features/Lang/lang';
import { BlogAuthor, BlogPost } from '../types';

const grammarCategory = (lang: SupportedLanguage) => {
  const i18n = getI18nInstance(lang);
  return {
    categoryTitle: i18n._('English Grammar'),
    categoryId: 'english_grammar',
  };
};

const aiAuthor: BlogAuthor[] = [{ role: 'author', name: 'Grok 4.6' }];

const relatedGrammarLinks = (i18n: { _: (s: string) => string }, currentId: string): string => {
  const links = [
    {
      id: 'present-perfect-vs-past-simple',
      text: i18n._('Present perfect vs past simple'),
    },
    {
      id: 'english-articles-a-an-the',
      text: i18n._('English articles: a, an, the'),
    },
    {
      id: 'gerund-vs-infinitive',
      text: i18n._('Gerund vs infinitive'),
    },
    {
      id: 'second-vs-third-conditional',
      text: i18n._('Second vs third conditional'),
    },
  ];

  return (
    `## ${i18n._('Related grammar')}\n\n` +
    links
      .filter((link) => link.id !== currentId)
      .map((link) => `- [${link.text}](/blog/${link.id})`)
      .join('\n')
  );
};

export const getGrammarSpeakingPracticePosts = (lang: SupportedLanguage): BlogPost[] => {
  const i18n = getI18nInstance(lang);
  const category = grammarCategory(lang);

  return [
    {
      id: 'present-perfect-vs-past-simple',
      title: i18n._('Present Perfect vs Past Simple: When to Use Each (With Examples)'),
      subTitle: i18n._(
        'A clear speaking guide to I have done vs I did — with everyday examples you can say out loud.',
      ),
      keywords: [
        'present perfect vs past simple',
        'I have gone vs I went',
        i18n._('when to use present perfect'),
        i18n._('present perfect examples'),
        i18n._('English grammar speaking practice'),
        'FluencyPal',
      ],
      imagePreviewUrl: '/blog/present-perfect-vs-past-simple.webp',
      publishedAtIso: '2026-09-04',
      category,
      authors: aiAuthor,
      relatedRolePlays: ['instant-correction', 'job-interview'],
      content: [
        i18n._(
          `The difference between **present perfect** and **past simple** is one of the most searched English grammar questions — and one of the easiest to hear in speech. Learners often know the forms on a quiz, then mix them up the moment they start talking.`,
        ),
        i18n._(
          `This guide is for speaking. Each example is a sentence you can say in a real conversation.`,
        ),
        `## ${i18n._('The short rule')}`,
        i18n._(
          `Use **past simple** when the time is finished and named (or clearly finished).\n\nUse **present perfect** when the time is still open, or when the result still matters now.`,
        ),
        `- **I sent** the email **yesterday**.\n- **I have sent** the email.`,
        i18n._(
          `If you can point to a finished time — *yesterday, last week, in 2019, when I was a student* — you almost always need past simple.`,
        ),
        `## ${i18n._('When to use past simple')}`,
        i18n._(
          `Past simple is the story tense. It answers “What happened?” at a specific time in the past.`,
        ),
        `**${i18n._('Use it for:')}**
- ${i18n._('a finished action with a finished time:')} **I called** her **this morning**.
- ${i18n._('a sequence of events:')} **I arrived**, **ordered** coffee, and **opened** my laptop.
- ${i18n._('a past habit with a time period that is over:')} **I lived** in Berlin **for two years**.`,
        i18n._(
          `**Do not use it** when you want to connect the past to now. *I lost my keys yesterday* is a story. *I have lost my keys* means you still do not have them.`,
        ),
        `## ${i18n._('When to use present perfect')}`,
        i18n._(
          `Present perfect (*have/has + past participle*) is not “more formal past.” It is past with a present reason.`,
        ),
        `**${i18n._('Use it for:')}**
- ${i18n._('life experience with no time stamp:')} **Have you ever worked** remotely?
- ${i18n._('news whose result is still true:')} **I have finished** the report.
- ${i18n._('an unfinished time window:')} **I have had** three meetings **today**.
- ${i18n._('a change that started in the past and continues:')} **She has lived** here **since 2021**.`,
        i18n._(
          `**Do not use it** with a finished time word. Not: *I have seen him yesterday.* Say: **I saw** him **yesterday.**`,
        ),
        `## ${i18n._('Side-by-side examples')}

| ${i18n._('Situation')} | Past simple | Present perfect |
| --- | --- | --- |
| ${i18n._('Finished time')} | **I went** to Lisbon **last year**. | — |
| ${i18n._('Experience')} | — | **I have been** to Lisbon. |
| ${i18n._('Today is still going')} | **I ate** at noon. | **I have eaten** twice **today**. |
| ${i18n._('Result now')} | **I broke** my phone **on Monday**. | **I have broken** my phone. |
| ${i18n._('Job history')} | **I worked** at Stripe **in 2022**. | **I have worked** in payments **for six years**. |`,
        i18n._(
          `Say both versions out loud. The grammar is the same contrast you will hear in interviews, stand-ups, and small talk.`,
        ),
        `## ${i18n._('Common speaking mistakes')}

**1. ${i18n._('Adding a finished time to present perfect')}**
- ${i18n._('Wrong:')} *I have talked to the client yesterday.*
- ${i18n._('Correct:')} **I talked** to the client **yesterday.**
- ${i18n._('Correct, without a finished time:')} **I have already talked** to the client.

**2. ${i18n._('Using past simple for “until now”')}**
- ${i18n._('Awkward:')} *Did you ever use Figma?*
- ${i18n._('More natural:')} **Have you ever used** Figma?

**3. ${i18n._('Mixing for and since')}**
- **for** + a period: **I have studied** English **for three years**.
- **since** + a starting point: **I have studied** English **since 2023**.

**4. ${i18n._('Forgetting the result-now meaning')}**
${i18n._('If you say **I lost** my passport, a listener may think it is an old story. If you still need help, say **I have lost** my passport.')}`,
        `## ${i18n._('Mini speaking drill')}

${i18n._('Read this paragraph aloud. Then tell the same story again without looking, and keep the tenses.')}

> Last year **I moved** to a new city. **I found** a flat in the first week. This month **I have changed** jobs, and **I have already met** most of the team. **I have not visited** my old office **since June**. Yesterday **I sent** a thank-you message to my old manager.

${i18n._('Notice the split: *last year / yesterday* take past simple. *this month / already / since June* take present perfect.')}`,
        `## ${i18n._('Practice this grammar by speaking')}

${i18n._('Reading the table helps. Using the contrast in your own voice is what makes it automatic.')}

${i18n._('FluencyPal [Interactive Lessons](/features/interactive-lesson) train one language form at a time. A typical lesson teaches when to use present perfect vs past simple, asks you to **read a short text aloud**, then has you answer by voice and talk for two or three minutes. You get feedback on the form, not a generic “speak more clearly.” Tomorrow’s lesson is built from what you actually said.')}

${i18n._('If you mix *I did* and *I have done* in real speech, this is a good first lesson to take.')}`,
        relatedGrammarLinks(i18n, 'present-perfect-vs-past-simple'),
      ].join('\n\n'),
    },
    {
      id: 'english-articles-a-an-the',
      title: i18n._('A, An, or The? How to Use English Articles in Real Speech'),
      subTitle: i18n._(
        'Simple rules for a, an, and the — with spoken examples for unique things, first mentions, and zero article.',
      ),
      keywords: [
        'English articles',
        'a an the',
        i18n._('when to use the'),
        i18n._('definite article English'),
        i18n._('indefinite article examples'),
        'FluencyPal',
      ],
      imagePreviewUrl: '/blog/english-articles-a-an-the.webp',
      publishedAtIso: '2026-09-03',
      category,
      authors: aiAuthor,
      relatedRolePlays: ['instant-correction', 'small-talk-with-a-stranger'],
      content: [
        i18n._(
          `English articles are tiny words with a loud effect. **A**, **an**, and **the** tell the listener whether you mean “one of many” or “that specific one.” Native speakers hear a missing **the** immediately — even when the rest of the sentence is fine.`,
        ),
        i18n._(
          `You do not need every textbook exception. You need a speaking rule you can apply in the next sentence.`,
        ),
        `## ${i18n._('The short rule')}

- **a / an** = ${i18n._('one of a group, not unique yet. First mention.')}
- **the** = ${i18n._('this one, the one we both can identify.')}
- ${i18n._('**no article** = general plural or uncountable meaning.')}

- I saw **a** dog. **The** dog was sleeping on **the** sofa.
- **Water** is expensive here. **The water** in this bottle is cold.`,
        `## ${i18n._('A vs an')}

${i18n._('Use **an** before a vowel *sound*, not just a vowel letter.')}

- **an** email, **an** hour, **an** MBA
- **a** university, **a** European office, **a** one-way ticket

${i18n._('Say them. *University* starts with /j/, so it takes **a**. *Hour* starts with a vowel sound, so it takes **an**.')}`,
        `## ${i18n._('When to use the')}

${i18n._('Use **the** when both speakers can identify the thing.')}

**1. ${i18n._('There is only one in this context')}**
- Close **the** door.
- I left my keys in **the** kitchen.
- **The** sun is still up.

**2. ${i18n._('You already mentioned it')}**
- I watched **a** film. **The** film was too long.

**3. ${i18n._('It is unique in that category')}**
- **the** landing page
- **the** CEO, **the** nearest station, **the** same problem

**4. ${i18n._('Superlatives and ordinals')}**
- **the** best option, **the** first meeting, **the** last slide`,
        `## ${i18n._('When not to use the')}

**${i18n._('General meaning (zero article)')}**
- **Cats** hate water.
- I like **jazz**. I study **history**.
- She works in **finance**. He is in **hospital**.

**${i18n._('Names and most cities / countries')}**
- I live in **Warsaw**. I work at **Google**.
- ${i18n._('Exceptions you will actually say:')} **the** Netherlands, **the** United States, **the** UK, **the** Czech Republic.

**${i18n._('Meals, days, and many institutions in a general way')}**
- We had **lunch**. See you on **Monday**.
- She went to **school** / **university** / **work**.

${i18n._('If you add a specifier, **the** often comes back: **the** lunch we skipped, **the** Monday after the launch.')}`,
        `## ${i18n._('Countable vs uncountable (the speaking trap)')}

${i18n._('You can say **a meeting**, **an idea**, **a task**. You cannot say *a software* or *an information*.')}

- I need **information**. I found **the information** in the brief.
- We bought **software**. **The software** is already installed.
- Can I have **advice**? **The advice** you gave me helped.

${i18n._('For uncountable nouns, first mention is often zero article or **some**. Second mention — when it is that specific stuff — takes **the**.')}`,
        `## ${i18n._('Side-by-side examples')}

| ${i18n._('Meaning')} | ${i18n._('Say this')} | ${i18n._('Do not say this')} |
| --- | --- | --- |
| ${i18n._('First mention, one of many')} | I have **a** question. | I have question. |
| ${i18n._('We both know which one')} | Did you read **the** email? | Did you read email? |
| ${i18n._('Unique in this product')} | Open **the** settings page. | Open a settings page. |
| ${i18n._('General plural')} | **Meetings** run long here. | The meetings run long here. |
| ${i18n._('Uncountable')} | I need **feedback**. | I need a feedback. |`,
        `## ${i18n._('Mini speaking drill')}

${i18n._('Read this aloud, then retell it with the articles still in place.')}

> I work on **a** language app. **The** app helps people speak. Yesterday I recorded **a** lesson. **The** lesson was about articles. I still need **feedback** from **the** team before **the** next release.

${i18n._('If you dropped **the** before *app*, *lesson*, *team*, or *next release*, the listener has to guess which one you mean.')}`,
        `## ${i18n._('Practice this grammar by speaking')}

${i18n._('Article mistakes are hard to fix with drills on paper. You need someone to catch **a demo video** vs **the landing page** while you talk.')}

${i18n._('FluencyPal [Interactive Lessons](/features/interactive-lesson) pick one checkable form — often articles with unique nouns — and walk you through it: a short how-to, a text to read aloud, spoken answers, then a two-to-three-minute open talk. Feedback focuses on the form you were practicing. The next lesson is generated from that talk, so you do not repeat the same *a/the* mix forever.')}`,
        relatedGrammarLinks(i18n, 'english-articles-a-an-the'),
      ].join('\n\n'),
    },
    {
      id: 'gerund-vs-infinitive',
      title: i18n._('Gerund vs Infinitive: Stop Doing or Stop to Do?'),
      subTitle: i18n._(
        'Learn the verb patterns that change meaning: remember to, remember -ing, try to, try -ing, and more.',
      ),
      keywords: [
        'gerund vs infinitive',
        'stop doing vs stop to do',
        'remember to vs remember -ing',
        'try to vs try -ing',
        i18n._('verb patterns English'),
        'FluencyPal',
      ],
      imagePreviewUrl: '/blog/gerund-vs-infinitive.webp',
      publishedAtIso: '2026-09-02',
      category,
      authors: aiAuthor,
      relatedRolePlays: ['instant-correction', 'alias-game'],
      content: [
        i18n._(
          `After many English verbs you must choose **-ing** (a gerund) or **to + verb** (an infinitive). Sometimes only one is correct. Sometimes both are possible — and they do not mean the same thing.`,
        ),
        i18n._(
          `That second case is what listeners notice. **I stopped smoking** and **I stopped to smoke** are different stories.`,
        ),
        `## ${i18n._('The short rule')}

- **verb + -ing** — ${i18n._('often feels like the activity itself (the thing, the habit, the experience).')}
- **verb + to do** — ${i18n._('often feels like a purpose, a plan, or a next action.')}

${i18n._('Memorizing a giant list is slow. Learn the patterns you actually say, then practice them out loud.')}`,
        `## ${i18n._('Verbs that usually take -ing')}

${i18n._('These are comfortable with a gerund:')} **enjoy, avoid, finish, consider, suggest, mind, keep, miss, delay**.

- I **enjoy speaking** in small groups.
- She **avoided answering** the question.
- We **finished writing** the brief.
- Would you **mind closing** the window?
- He **keeps interrupting** me.

${i18n._('After a preposition, English wants **-ing**:')} **good at explaining**, **interested in moving**, **instead of waiting**, **before sending**.`,
        `## ${i18n._('Verbs that usually take to + verb')}

${i18n._('These want an infinitive:')} **want, need, decide, plan, hope, promise, refuse, learn, offer, agree, expect**.

- I **need to finish** this today.
- We **decided to postpone** the call.
- She **promised to send** the file.
- They **refused to sign**.
- I **hope to hear** from you soon.

**Would like / would love / would prefer** ${i18n._('also take **to**:')} I **would like to ask** one thing.`,
        `## ${i18n._('The pairs that change meaning')}

${i18n._('These are the forms worth drilling until they are automatic.')}

### ${i18n._('Stop doing vs stop to do')}

- **I stopped checking** Slack. (${i18n._('I quit that habit.')})
- **I stopped to check** Slack. (${i18n._('I paused another activity in order to check.')})

### Remember / forget

- **Remember to lock** the door. (${i18n._('Do this later. A reminder.')})
- I **remember locking** the door. (${i18n._('I have a memory of it.')})
- **I forgot to send** the invoice. (${i18n._('I did not do it.')})

### Try

- **Try to open** the file. (${i18n._('Make an effort. It may be hard.')})
- **Try opening** it in another browser. (${i18n._('Test this method.')})

### Mean

- I **meant to write** sooner. (${i18n._('intention')})
- This **means starting** over. (${i18n._('this action involves / equals')})

### Regret

- I **regret to say** we cannot join. (${i18n._('formal bad news')})
- I **regret saying** that in the meeting. (${i18n._('I wish I had not said it.')})`,
        `## ${i18n._('Side-by-side examples')}

| ${i18n._('You want to say')} | ${i18n._('Use this')} | ${i18n._('Do not say this')} |
| --- | --- | --- |
| ${i18n._('Quit a habit')} | I **stopped drinking** soda. | I stopped to drink soda. |
| ${i18n._('Pause in order to do X')} | I **stopped to ask** for directions. | I stopped asking for directions. |
| ${i18n._('Reminder')} | **Remember to call** her. | Remember calling her. |
| ${i18n._('Memory')} | I **remember calling** her. | Remember to call her. |
| ${i18n._('Effort')} | **Try to explain** it in English. | Try explaining it. |
| ${i18n._('Experiment')} | **Try restarting** the app. | Try to restart. |`,
        `## ${i18n._('Mini speaking drill')}

${i18n._('Read this, then retell it with the same verb patterns.')}

> I **enjoy working** from cafés, but I **need to finish** a report today. I **stopped scrolling** and **started writing**. After an hour I **stopped to buy** coffee. I **forgot to charge** my laptop. Next time I will **try working** near a socket, and I will **remember to bring** a charger.

${i18n._('If you said *I stopped to scrolling* or *I need finishing*, the pattern broke. The lesson is not “more fluency.” It is this contrast.')}`,
        `## ${i18n._('Practice this grammar by speaking')}

${i18n._('Verb patterns only stick when you hear yourself get them wrong.')}

${i18n._('FluencyPal [Interactive Lessons](/features/interactive-lesson) teach one checkable chunk at a time — for example **try to** vs **try -ing**, or **stop doing** vs **stop to do**. You read a short how-to, read a passage aloud, then record answers and a longer talk. Feedback checks the form. The following lesson is generated from that talk, so the next contrast is new.')}`,
        relatedGrammarLinks(i18n, 'gerund-vs-infinitive'),
      ].join('\n\n'),
    },
    {
      id: 'second-vs-third-conditional',
      title: i18n._('Second vs Third Conditional: If I Were vs If I Had'),
      subTitle: i18n._(
        'Unreal present vs unreal past — clear rules, spoken examples, and the mixed forms you hear at work.',
      ),
      keywords: [
        'second vs third conditional',
        'if I were vs if I was',
        'if I had known',
        i18n._('unreal conditional English'),
        i18n._('mixed conditionals'),
        'FluencyPal',
      ],
      imagePreviewUrl: '/blog/second-vs-third-conditional.webp',
      publishedAtIso: '2026-09-01',
      category,
      authors: aiAuthor,
      relatedRolePlays: ['instant-correction', 'job-interview'],
      content: [
        i18n._(
          `Conditionals are how English talks about imaginary presents and imaginary pasts. In speech, the useful split is this:`,
        ),
        `- **${i18n._('Second conditional')}**: ${i18n._('not true *now* (or very unlikely).')}
- **${i18n._('Third conditional')}**: ${i18n._('not true *then* — you are looking back.')}

**If I were** you… ${i18n._("that's second conditional.")} **If I had known**… ${i18n._("that's third conditional.")} ${i18n._('Mixing the two is one of the most common advanced-sounding mistakes.')}`,
        `## ${i18n._('The short rule')}

**${i18n._('Second conditional:')}** *If + past*, *would + verb*  
(${i18n._('imaginary present or future')})

- **If I had** more time, **I would rewrite** the intro.
- **If she were** here, **she would explain** it.

**${i18n._('Third conditional:')}** *If + had + past participle*, *would have + past participle*  
(${i18n._('imaginary past — too late')})

- **If I had had** more time, **I would have rewritten** the intro.
- **If she had been** here, **she would have explained** it.

${i18n._('Same idea. Different time. That is the whole lesson.')}`,
        `## If I were vs if I was

${i18n._('In careful English, unreal **be** is **were** for every person:')} **If I were**, **if he were**, **if it were**.

- **If I were** you, I would take the offer.
- **If it were** cheaper, we would buy it.

${i18n._('**If I was** appears in casual speech. It is widely understood. In interviews, presentations, and written follow-ups, **If I were** still sounds more controlled. Practice **were** until it is the one you reach for.')}

${i18n._('Do not confuse this with a real past:')} **If I was rude yesterday, I am sorry.** ${i18n._('That *was* is a real possibility, not an imaginary present.')}`,
        `## ${i18n._('When to use the second conditional')}

${i18n._('Use it for advice, hypothetical jobs, polite distance, and “not my real situation.”')}

- **If I worked** there, **I would ask** for a clearer brief.
- **If we moved** the meeting, more people **would join**.
- **If I didn’t need** a visa, **I would go** next month.

${i18n._('The past tense here is not about yesterday. It is a signal: this is not real.')}`,
        `## ${i18n._('When to use the third conditional')}

${i18n._('Use it for regret, blame, relief, and “that ship has sailed.”')}

- **If I had seen** the email, **I would have replied**.
- **If we had tested** it, **we would not have shipped** that bug.
- **If you had told** me, **I would have waited**.

${i18n._('The event is closed. You cannot change it. You can only comment.')}`,
        `## ${i18n._('Mixed conditionals (what you hear at work)')}

${i18n._('People often mix times on purpose.')}

**${i18n._('Past condition, present result')}**
- **If I had taken** that job, **I would be** in London now.

**${i18n._('Present condition, past result')}**
- **If I were** more organized, **I would have sent** this yesterday.

${i18n._('These are useful. They are not a license to randomly combine *would* and *had*. Keep one half clearly past and one half clearly present.')}`,
        `## ${i18n._('Side-by-side examples')}

| ${i18n._('Meaning')} | ${i18n._('Second (now / future)')} | ${i18n._('Third (past, too late)')} |
| --- | --- | --- |
| ${i18n._('Time')} | **If I had** a spare hour today, **I would review** it. | **If I had had** a spare hour yesterday, **I would have reviewed** it. |
| ${i18n._('Advice')} | **If I were** you, **I would wait**. | **If I had been** you then, **I would have waited**. |
| ${i18n._('Missed chance')} | — | **If we had applied** earlier, **we would have got** an interview. |
| ${i18n._('Unreal present')} | **If the app were** faster, people **would stay**. | — |`,
        `## ${i18n._('Mini speaking drill')}

${i18n._('Read this, then tell a similar story about your own week.')}

> **If I were** the hiring manager, **I would ask** for a portfolio, not a long CV. Last week **I would have prepared** better **if I had known** there was a case study. **If we had started** earlier, **we would be** done now.

${i18n._('That last sentence is mixed: past condition, present result. Keep the pieces:')} **had started** / **would be**.`,
        `## ${i18n._('Practice this grammar by speaking')}

${i18n._('Conditionals collapse under pressure. You start a sentence with *if*, then grab the wrong half.')}

${i18n._('FluencyPal [Interactive Lessons](/features/interactive-lesson) train one contrast at a time — second vs third, or **if I were** with unreal present. You read a short how-to, read a text aloud, answer by voice, then speak for two or three minutes on a concrete topic. Feedback checks the form. The next lesson is generated from that talk, so you move to a new pattern instead of looping the same *if I would have* mistake.')}`,
        relatedGrammarLinks(i18n, 'second-vs-third-conditional'),
      ].join('\n\n'),
    },
  ];
};
