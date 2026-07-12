import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

export const getJobInterviewScenario = (
  i18n: I18n,
  _lang: SupportedLanguage,
): RolePlayInstruction => ({
  id: 'job-interview',
  title: i18n._('Practice a Job Interview'),
  shortTitle: i18n._('Job Interview'),

  landingHighlight: i18n._(
    'Practice answering realistic interview questions, presenting your achievements, discussing difficult situations, and explaining why you are a strong candidate.',
  ),

  contentPage:
    i18n._(`A successful job interview is not about memorizing perfect answers. It is about helping the interviewer understand what you can do, how you work, and why your experience is relevant.

Strong answers are clear, specific, and supported by real examples. You do not need complicated vocabulary or overly formal language. Focus on explaining your experience in a structured and convincing way.

## Prepare Before the Interview

Before the interview, review:

- The role and its main responsibilities
- The most important requirements
- The company’s products and customers
- Your most relevant experience
- Two or three achievements
- Examples of problems you solved
- Questions you want to ask

Connect your experience to the vacancy. If teamwork is important, prepare a teamwork example. If the role requires leadership, think of a time you took responsibility or helped a team make progress.

You do not need to match every requirement. Be ready to explain how your existing skills can transfer to unfamiliar responsibilities.

## Introduce Yourself

Many interviews begin with:

> “Could you tell me about yourself?”

Give a short professional summary covering:

1. What you do
2. Your relevant experience
3. Your strongest skills
4. Why you want this role

A useful structure is:

> “I’m a [profession] with experience in [area]. In my current or most recent role, I [responsibility or achievement]. My strongest skills include [skills]. I’m now looking for an opportunity where I can [goal connected to the vacancy].”

Example:

> “I’m a frontend developer with five years of experience building web applications. I mainly work with React and TypeScript and help improve frontend architecture and automated testing. I’m now looking for a role where I can take more ownership and contribute to technical decisions.”

Keep your introduction focused. One or two minutes is usually enough.

## Explain Your Motivation

Interviewers may ask:

- “Why are you interested in this position?”
- “Why do you want to work here?”
- “Why are you leaving your current role?”

Connect three things:

- Something specific about the role or company
- Your relevant experience
- What you want to develop next

Example:

> “I’m interested in this role because it combines frontend development with product ownership. I have experience building React applications and improving testing processes, and I would now like to participate more actively in architecture and product decisions.”

Avoid focusing only on salary, remote work, or needing any available job.

## Use the STAR Method

For questions about past experience, use **STAR**:

- **Situation:** Explain the context.
- **Task:** Describe your responsibility.
- **Action:** Explain what you personally did.
- **Result:** Describe the outcome and lesson.

Example:

> “Our checkout page frequently failed on mobile devices. I investigated analytics and reproduced the issue on several devices. I discovered that two requests were creating a race condition, changed the request flow, and added integration tests. After the release, mobile checkout errors decreased significantly.”

The **Action** section should usually contain the most detail. Interviewers want to understand your contribution, not only what the team did.

## Make Answers Specific

Compare:

> “I helped improve the product.”

With:

> “I redesigned the onboarding flow, simplified three steps with the designer, and added analytics. The percentage of users completing onboarding increased from 62% to 78%.”

Use accurate numbers when they are meaningful. You can mention increased revenue, reduced errors, faster delivery, saved time, improved satisfaction, or more completed processes.

When exact numbers are unavailable, describe a concrete result:

- “The support team stopped receiving repeated complaints.”
- “We completed the migration without downtime.”
- “The solution was adopted by two other teams.”

Do not invent statistics.

## Explain Your Contribution

Interviewers may ask about your responsibilities, projects, or role within a team.

Useful phrases include:

- “I was responsible for…”
- “My main contribution was…”
- “I took ownership of…”
- “I worked closely with…”
- “The team delivered the project, while I focused on…”
- “I was involved from planning through release.”

Use “we” for shared results and “I” for your own actions.

## Describe Strengths With Evidence

Choose strengths that are relevant to the role and support them with examples.

Instead of:

> “I’m a good communicator.”

Try:

> “One of my strengths is explaining technical decisions to non-technical colleagues. During our last redesign, I used simple prototypes to explain performance trade-offs to the product and design teams. This helped us agree on a solution without delaying the release.”

Possible strengths include problem-solving, reliability, communication, adaptability, leadership, organization, technical expertise, and learning quickly.

## Discuss a Weakness Honestly

Choose a real limitation that does not make you unsuitable for the role. Explain:

1. What the weakness is
2. When it affects you
3. What you are doing about it
4. What progress you have made

Example:

> “I sometimes spend too much time refining details before sharing my work. I now share earlier drafts and agree on the expected level of detail before starting. This has helped me get feedback sooner and work more efficiently.”

Avoid disguised strengths such as “I work too hard.”

## Explain Mistakes and Failures

A good answer demonstrates responsibility and learning.

Include:

- What happened
- What your role was
- What you should have done differently
- How you reduced the impact
- What you changed afterward

Example:

> “I underestimated a data migration because I did not include enough time for testing with production data. I raised the risk early, reduced the first release’s scope, and created a better validation plan. Since then, I include validation and rollback planning in migration estimates.”

Do not blame colleagues or pretend the mistake had no consequences.

## Talk About Conflict

When describing a disagreement, explain:

- What the disagreement was about
- Why both sides had reasonable concerns
- How you listened and explained your view
- How the decision was made
- What happened afterward

Example:

> “A designer and I disagreed about an animation that caused performance problems on older phones. I prepared two prototypes and measured their performance. We chose a simpler version that preserved the main visual effect.”

Focus on communication and resolution. Avoid describing the other person as incompetent or unreasonable.

## Explain How You Work

Interviewers may ask how you communicate, ask for help, give feedback, or manage shared responsibility.

Useful phrases include:

- “I keep stakeholders informed by…”
- “I prefer to raise risks early.”
- “When I am blocked, I first…, and then…”
- “I focus feedback on the work and its impact.”
- “I make sure responsibilities are clear before we begin.”
- “I adapt the level of detail to the person I am speaking with.”

Support these claims with examples.

## Explain How You Prioritize

When several tasks seem urgent:

- Compare their business impact
- Check deadlines and dependencies
- Discuss trade-offs
- Confirm priorities with the relevant person
- Divide work into smaller deliverables
- Communicate risks early

Example:

> “I compare the customer impact, deadlines, and dependencies of each task. I confirm priorities with the product owner instead of making assumptions and communicate immediately if the timeline is at risk.”

## Answer Hypothetical Questions

For unfamiliar situations:

1. Clarify the situation.
2. Identify the goal and constraints.
3. Gather information.
4. Consider the options.
5. Communicate with relevant people.
6. Take action.
7. Review the result.

You can ask a clarifying question before answering:

> “Would I be responsible for making the final decision, or would I be advising the project owner?”

## Be Honest About Missing Experience

You can say:

- “I have not used that exact tool, but I have worked with a similar one.”
- “I do not yet have direct experience in that area.”
- “My closest relevant experience is…”
- “I would approach learning it by…”
- “Although I have not done that professionally, I used it in a personal project.”

A useful structure is:

> “I have not done X directly, but I have experience with Y, which uses similar principles. I learned Z quickly in my previous role, so I would use a similar approach here.”

Do not exaggerate your experience.

## Explain Career Changes and Employment Gaps

Keep the explanation honest, concise, and focused on the future.

Useful phrases include:

- “I took time away from work to…”
- “My position was affected by restructuring.”
- “I decided to change direction because…”
- “During that period, I focused on…”
- “The experience helped me clarify that I want to…”

You do not need to disclose deeply personal information.

## Discuss Salary Expectations

You can provide a range:

> “Based on the responsibilities and my experience, I’m targeting a gross annual salary between X and Y. I’m also considering the full compensation package and the scope of the role.”

You can also ask:

- “Could you share the budgeted salary range?”
- “Does the figure include bonuses?”
- “Are there regular salary reviews?”
- “Is there flexibility depending on the final responsibilities?”

Research local market rates and consider salary, benefits, vacation, working arrangements, and development opportunities.

## Ask Questions at the End

Prepare several thoughtful questions.

### About the role

- “What would success look like during the first three months?”
- “What are the most important problems this person should solve?”
- “Why is the position currently open?”
- “What are the biggest challenges in this role?”

### About the team

- “How is the team structured?”
- “Who would I work with most closely?”
- “How are important decisions made?”
- “How does the team share feedback?”

### About the process

- “What are the next steps?”
- “Is there anything about my experience you would like me to clarify?”
- “When do you expect to make a decision?”

Use this opportunity to evaluate the role, not only to demonstrate interest.

## Ask for Clarification

You do not need to answer immediately when a question is unclear.

Useful phrases include:

- “Could you clarify what you mean?”
- “Would you like an example from my current role?”
- “Could you repeat the question, please?”
- “May I take a moment to think?”
- “Let me make sure I understood correctly.”

A short pause is better than an unfocused answer.

## Keep Answers Focused

Most answers should take between one and three minutes.

A useful structure is:

1. Begin with your main point.
2. Give one relevant example.
3. Explain your actions and the result.
4. Stop and allow a follow-up question.

A strong opening might be:

> “Yes. The best example is a migration project I led last year.”

If your answer becomes too long, say:

- “The main result was…”
- “To summarize…”
- “The most important lesson was…”

## Communicate Naturally in a Second Language

Perfect grammar is not required. Prioritize:

- Clear structure
- Specific examples
- Understandable pronunciation
- Relevant information
- Careful listening
- Asking for clarification

Useful phrases include:

- “What I mean is…”
- “Let me explain that another way.”
- “I’m looking for the right word.”
- “Could you speak a little more slowly?”
- “I need a moment to organize my answer.”

Correcting yourself calmly is completely acceptable.

## Online Interview Tips

Before a video interview:

- Test your camera, microphone, and internet connection.
- Join several minutes early.
- Keep your CV and the vacancy nearby.
- Close unnecessary applications and notifications.
- Choose a quiet, well-lit place.
- Keep the interviewer’s contact details available.

If there is a technical problem, say:

- “I’m sorry, the audio is breaking up.”
- “Could you repeat the last sentence?”
- “I think there is a delay.”
- “Would you mind if I turned off my camera?”
- “Could we reconnect using the same link?”

## End Professionally

At the end, you can say:

- “Thank you for your time.”
- “I enjoyed learning more about the role.”
- “The position sounds closely connected to what I would like to do next.”
- “Please let me know if you need any additional information.”
- “I look forward to hearing about the next steps.”

Express interest, thank the interviewer, and confirm the process.

## A Simple Answer Formula

For most experience-based questions, use:

1. **Answer:** Give your main point.
2. **Example:** Describe one relevant situation.
3. **Action:** Explain what you did.
4. **Result:** Describe the outcome.
5. **Relevance:** Connect it to the position.

## Practice Scenario

In this roleplay, the AI recruiter will interview you for your desired position. When you provide a CV or vacancy description, the questions will be adapted to your experience and the role.

During the interview, try to:

- Give a focused professional introduction.
- Explain why you want the role.
- Use the STAR method.
- Support strengths with examples.
- Discuss mistakes and weaknesses honestly.
- Explain your personal contribution.
- Ask for clarification when necessary.
- Ask thoughtful questions.
- Close the interview professionally.

Treat it like a real interview. The recruiter may ask follow-up questions or challenge vague answers. Detailed feedback will be provided after the interview so the conversation remains realistic.`),
  category: {
    categoryTitle: i18n._('Professional'),
    categoryId: 'professional',
  },

  analyzeResultAiInstruction: `Evaluate the user's complete interview performance as a professional interview coach.

Base the evaluation only on information provided during the roleplay and in the user's optional CV and vacancy description. Do not invent experience, achievements, or job requirements.

Provide feedback using this structure:

## Overall Assessment
Give a concise assessment of how convincing and interview-ready the candidate appeared.

## Scores
Score each category from 1 to 10 and briefly explain the score:
- Relevance to the role
- Clarity and structure
- Use of specific examples
- Communication of personal contribution
- Professional confidence
- Handling of difficult questions
- Language clarity
- Questions asked by the candidate

## Strongest Answers
Identify two or three strong moments. Explain what made them effective.

## Answers to Improve
Identify up to three answers that were vague, overly long, unsupported, confusing, or poorly aligned with the vacancy. Explain the specific issue.

## Improved Answer Examples
Rewrite the weaker answers using only facts the user actually provided. Do not invent numbers or professional experience. Use the STAR structure when appropriate.

## Language Feedback
Identify recurring language issues that affected clarity. Prioritize the most important patterns rather than correcting every mistake. Include natural alternative phrases.

## Interview Strategy
Give three concrete recommendations for the user's next interview.

Keep the tone direct, encouraging, and practical.`,

  input: [
    {
      id: 'cv',
      labelForUser: i18n._('Your experience'),
      labelForAi: "Candidate's professional experience",
      placeholder: i18n._(
        'Paste your CV or write a short summary of your experience, skills, and achievements.',
      ),
      type: 'textarea',
      defaultValue: '',
      lengthToTriggerSummary: 300,
      aiSummarizingInstruction: `Summarize the candidate's professional background for an interviewer.

Include:
- Current or most recent role
- Total experience when stated
- Relevant industries
- Main responsibilities
- Important skills and tools
- Measurable achievements
- Leadership or collaboration experience
- Career changes or gaps when explicitly stated

Use only information present in the candidate's text. Do not infer missing experience or invent achievements. Keep the summary under 10 sentences.`,
      required: false,
    },
    {
      id: 'job-title',
      labelForUser: i18n._('Desired Job Title'),
      labelForAi: "Candidate's desired job title",
      placeholder: i18n._(
        'For example: Frontend Developer, Shop Assistant, Product Designer, or Fitness Trainer.',
      ),
      type: 'text-input',
      defaultValue: '',
      required: true,
    },
    {
      id: 'vacancy',
      labelForUser: i18n._('Vacancy description'),
      labelForAi: 'Target vacancy and interview preparation',
      placeholder: i18n._(
        'Paste the vacancy description or briefly describe the responsibilities and requirements.',
      ),
      type: 'textarea',
      defaultValue: '',
      lengthToTriggerSummary: 300,
      aiSummarizingInstruction: `Analyze the vacancy description and prepare context for a realistic interview.

Use this structure:

Job Summary:
Summarize the role, responsibilities, company context, and seniority in no more than 5 sentences.

Core Requirements:
List the most important skills, experience, and personal qualities requested.

Potential Concerns:
Identify requirements that may need clarification during the interview. Compare them with the candidate's CV only when candidate information is available. Do not assume that a missing skill is absent unless the CV clearly indicates this.

Interview Questions:
Create 10 relevant questions covering:
- Professional introduction
- Motivation
- Relevant experience
- Technical or role-specific skills
- A measurable achievement
- Problem-solving
- Teamwork or conflict
- A mistake or difficult situation
- A requirement that needs clarification
- Candidate questions for the employer

Adapt questions to the candidate's supplied experience. Do not include questions already fully answered by the CV, but follow-up questions about that experience are allowed.

Use only the vacancy and candidate information provided. Do not invent company details.`,
      required: false,
    },
  ],

  subTitle: i18n._(
    'Practice presenting your experience and answering realistic interview questions',
  ),

  instructionToAi: `You are Marin, a professional recruiter conducting a realistic job interview. The user is applying for the desired job title they provided.

Use the candidate's CV and vacancy description when available. Do not invent details about the candidate, vacancy, or company.

Interview structure:
1. Briefly introduce yourself and the fictional company.
2. Ask the candidate to introduce themselves.
3. Ask about their motivation for applying.
4. Explore the experience most relevant to the role.
5. Ask behavioral questions about achievements, problem-solving, teamwork, conflict, mistakes, priorities, and learning.
6. Ask role-specific questions based on the vacancy.
7. Give the candidate an opportunity to ask questions.
8. End the interview professionally and explain that feedback will follow.

During the interview:
- Ask one main question at a time.
- Keep your messages concise and natural.
- Ask relevant follow-up questions based on the user's previous answer.
- Adjust the difficulty to the candidate's seniority and answer quality.
- Ask for a specific example when an answer is vague or theoretical.
- Encourage the candidate to explain their personal contribution, actions, and results.
- Ask for measurable outcomes when appropriate, but never pressure the user to invent numbers.
- Challenge inconsistencies politely.
- Allow the candidate time to think or ask for clarification.
- Do not provide an ideal answer after every response.
- Do not give detailed coaching during the interview, because that makes the simulation unrealistic.
- You may give a brief neutral acknowledgement before continuing, such as “Thank you” or “That is helpful.”
- Do not correct every language mistake during the interview.
- Do not discriminate or ask questions about protected or highly personal characteristics.
- Avoid questions about age, religion, ethnicity, disability, pregnancy, marital status, political beliefs, or other irrelevant personal matters.
- Do not ask the user to disclose confidential information from current or previous employers.
- If no vacancy description is provided, conduct a general interview appropriate to the desired job title.
- If no CV is provided, begin with broad questions and learn about the candidate through their answers.
- Near the end, ask whether the candidate has questions about the role, team, company, or hiring process.
- Stay in character until the interview is complete or the user explicitly asks to stop.
- Save comprehensive evaluation and improved answer examples for the final analysis.`,

  exampleOfFirstMessageFromAi:
    'Hello, I’m Marin, a recruiter at Northstar. Thank you for joining me today. To begin, could you give me a brief introduction to your professional background and explain what interested you in this position?',

  illustrationDescription:
    'A professional recruiter reviewing a candidate’s CV during a job interview. The candidate sits across the desk, speaking confidently in a modern office environment.',

  imageSrc: '/role/07d20442-758f-42a9-81b2-3dc7bf4fe248.webp',
  videoSrc: '/role/090f7de1-91bd-4210-a99c-4eb077c9efd7_1.mp4',
  voice: 'marin',
});
