import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewQuiz } from "../../types";
import { getI18nInstance } from "@/appRouterI18n";

export const getQuizData = (lang: SupportedLanguage): InterviewQuiz => {
  const i18n = getI18nInstance(lang);

  return {
    steps: [
      // 1 Intro / Hook
      {
        type: "info",
        id: "intro-step",
        title: i18n._("Are you ready for a senior frontend interview?"),
        subTitle: i18n._(
          "Most experienced developers fail interviews not because of skills, but because of how they explain decisions."
        ),
        buttonTitle: i18n._("Start Test"),
        listItems: [
          {
            title: i18n._("Real senior-level interview questions"),
            iconName: "lightbulb",
          },
          {
            title: i18n._("Architecture & performance focus"),
            iconName: "layers",
          },
          {
            title: i18n._("Personalized feedback in minutes"),
            iconName: "sparkles",
          },
        ],
      },

      // 2 Current level
      {
        type: "options",
        id: "your-level-step",
        title: i18n._("What best describes your current level?"),
        subTitle: i18n._("This helps us calibrate interview expectations."),
        multipleSelection: false,
        options: [
          { label: i18n._("Mid-level Frontend Developer") },
          { label: i18n._("Senior Frontend Developer") },
          { label: i18n._("Frontend Lead / Tech Lead") },
          { label: i18n._("Full-stack with strong frontend focus") },
        ],
        buttonTitle: i18n._("Next"),
      },

      // 3 Primary framework
      {
        type: "options",
        id: "primary-framework",
        title: i18n._("Which frontend stack do you mainly work with?"),
        subTitle: i18n._("Your answers will be evaluated against this stack."),
        multipleSelection: false,
        options: [
          { label: i18n._("React / Next.js") },
          { label: i18n._("Vue / Nuxt") },
          { label: i18n._("Angular") },
          { label: i18n._("Multiple frameworks") },
          { label: i18n._("Other / Vanilla JS") },
        ],
        buttonTitle: i18n._("Next"),
      },

      // 4 Main interview weakness
      {
        type: "options",
        id: "main-weakness",
        title: i18n._("What usually hurts you most in interviews?"),
        subTitle: i18n._("Pick the closest match."),
        multipleSelection: false,
        options: [
          { label: i18n._("Explaining architecture decisions clearly") },
          { label: i18n._("System design questions") },
          { label: i18n._("Performance & optimization questions") },
          { label: i18n._("Behavioral / leadership questions") },
          { label: i18n._("Salary & senior-level negotiations") },
        ],
        buttonTitle: i18n._("Next"),
      },

      // 5 Answer behavior
      {
        type: "options",
        id: "answer-style",
        title: i18n._("When asked an open-ended question, you usually…"),
        subTitle: i18n._("Choose the closest option."),
        multipleSelection: false,
        options: [
          { label: i18n._("Jump straight into implementation details") },
          { label: i18n._("Explain concepts but struggle to structure the answer") },
          { label: i18n._("Answer confidently but worry it’s not senior enough") },
          { label: i18n._("Pause too long trying to find the perfect answer") },
          { label: i18n._("Feel structured and confident most of the time") },
        ],
        buttonTitle: i18n._("Next"),
      },

      {
        type: "options",
        id: "interview-timeline",
        title: i18n._("When is your next important interview?"),
        subTitle: i18n._("We’ll adjust preparation intensity."),
        multipleSelection: false,
        options: [
          { label: i18n._("Within 7 days") },
          { label: i18n._("1–2 weeks") },
          { label: i18n._("Within a month") },
          { label: i18n._("Not scheduled yet") },
        ],
        buttonTitle: i18n._("See Results"),
      },

      {
        type: "analyze-inputs",
        id: "ai-feedback-step-1",
        title: i18n._("Your senior frontend interview profile"),
        subTitle: i18n._("Based on your answers and senior-level interview patterns."),
        buttonTitle: i18n._("Continue"),

        aiSystemPrompt: `
You are an expert senior frontend interviewer at a top product company.

You are speaking DIRECTLY to the user.
Always use second-person language ("you", "your").
Never refer to the user as "the candidate", "this person", or "they".

Based ONLY on the user's previous quiz answers (experience level, primary framework, weaknesses, answer style, and interview timeline), generate a concise but insightful senior frontend interview profile.

Do NOT assume the user has answered real interview questions yet.
Do NOT invent technical answers.
This is a diagnostic profile, not a full evaluation.

Your goal:
- Reflect how interviewers would likely perceive YOU in a senior frontend interview
- Identify risks that commonly block senior frontend offers
- Highlight YOUR strengths clearly
- Create motivation to continue with full interview simulations

Return the result in MARKDOWN using the exact structure below.
Do not change headings or order.

---

#### 📌 Interview Profile Summary
Write 1–2 sentences addressing the user directly (use "you").
Example tone: "You show strong experience in X, but interviewers may still question Y."

#### 📊 Estimated Readiness Score
Give a single percentage (0–100%) representing YOUR likelihood of passing a senior frontend interview today.
Explain the score in one sentence, addressing the user directly.

#### ⚠️ Interview Risks
List 3–4 bullet points describing realistic risks that could cause YOU to be rejected at senior level.
Use direct language (e.g., "Interviewers may doubt...", "Your answers may feel...").

#### 🎯 What Interviewers Will Expect Next
List 3 concrete expectations senior interviewers will have from YOU to pass.
Frame these as gaps to close.

#### 🚀 Recommended Focus Areas
List 3 focused improvement areas that would most increase YOUR chances quickly.
These should naturally align with practicing mock interviews and structured answers.

Tone:
- Professional
- Honest but encouraging
- Senior-level (no beginner explanations)
- No hype, no emojis
- Always second-person ("you", "your")

End without a CTA or sales message.
`,
        aiResponseFormat: "markdown",
      },

      {
        type: "info",
        id: "value-bridge-step",
        title: i18n._("How FluencyPal helps you pass senior interviews"),
        subTitle: i18n._("No theory. No tutors. Just real interview practice."),
        listItems: [
          { title: i18n._("Real senior interview simulations"), iconName: "video" },
          { title: i18n._("AI feedback on structure and depth"), iconName: "brain" },
          { title: i18n._("Architecture & performance focus"), iconName: "layers" },
          { title: i18n._("Personalized improvement plan"), iconName: "target" },
        ],
        buttonTitle: i18n._("Continue"),
      },

      {
        id: "ai-practice-plant",
        type: "analyze-inputs",
        title: i18n._("Preparation plan"),
        subTitle: i18n._(
          "Here's a personalized training plan we'll use during your preparation. Step by step, you'll improve your answers and prepare for next-level results."
        ),
        buttonTitle: i18n._("Continue"),
        aiSystemPrompt: `
Your goal is to create a personalized plan for preparing for Senior Frontend Developer interview.
Always use second-person language ("you", "your").

Below is a conversation between a student (User) and a teacher (AI Interviewer).
Based on the user's level, generate a personalized practice plan that can be completed using our AI-powered language learning app.

Important: Do not focus on language learning, but rather on interview preparation.

Finish the plan with salary negotiation steps.

`,
        aiResponseFormat: "practice-plan",
      },

      {
        type: "paywall",
        id: "upgrade-step",
        title: i18n._("Unlock Your Trial and Get Full Feedback"),
        subTitle: i18n._("No payment required after trial. You decide when to pay."),
        listItems: [],
        buttonTitle: i18n._("Start Trial"),
      },

      {
        type: "analyze-inputs",
        id: "score-card",
        title: i18n._("AI Feedback on Your Answers"),
        subTitle: "",
        buttonTitle: i18n._("Continue"),
        aiSystemPrompt: `Provide brief feedback on the user's answers in JSON format, focusing on technical depth, clarity, and structure. 
Use this JSON structure for your response:
{
  label: "Interview Readiness Score",
  totalScore: 82,
  description: "Strong knowledge of React and TypeScript. Slight gaps in communication and leadership answers.",
  scoreMetrics: [
    { title: "React & TypeScript", score: 88 },
    { title: "Coding Skills", score: 90 },
    { title: "Problem Solving", score: 80 },
    { title: "Communication & Leadership", score: 70 },
  ],
}

totalScore should be an overall score out of 100.
Each score in scoreMetrics should be between 0 and 100.
description should summarize strengths and areas for improvement.
`,
        aiResponseFormat: "json-scope",
      },

      // Finish
      {
        type: "waitlist-done",
        id: "completion-step",
        title: i18n._("You're All Set!"),
        subTitle: i18n._(
          "Thank you for completing the Senior Frontend Developer interview prep. You will be notified via email once your trial is activated. It may take some time."
        ),
        listItems: [],
        buttonTitle: i18n._("Return to Dashboard"),
      },
    ],
  };
};
