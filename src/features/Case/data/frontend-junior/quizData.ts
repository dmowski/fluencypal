import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewQuiz } from "../../types";
import { getI18nInstance } from "@/appRouterI18n";

export const getQuizData = (lang: SupportedLanguage): InterviewQuiz => {
  const i18n = getI18nInstance(lang);

  return {
    steps: [
      {
        type: "info",
        id: "intro-step",
        title: i18n._("Welcome to Your Junior Frontend Developer Interview Prep"),
        subTitle: i18n._(
          "In this session, you'll answer questions designed for junior frontend roles. After responding, you'll receive feedback to help you improve your answers, confidence, and interview structure."
        ),
        buttonTitle: i18n._("Start Test"),
        listItems: [
          {
            title: i18n._("Real junior-level frontend questions"),
            iconName: "lightbulb",
            iconColor: "rgb(96, 165, 250)",
          },
          {
            title: i18n._("AI feedback on clarity and fundamentals"),
            iconName: "badge-check",
            iconColor: "rgb(96, 165, 250)",
          },
          {
            title: i18n._("Practical tips you can apply immediately"),
            iconName: "circle-fading-arrow-up",
            iconColor: "rgb(96, 165, 250)",
          },
        ],
      },

      {
        type: "info",
        id: "mic-access-step",
        imageUrl:
          "https://circl.es/wp-content/uploads/2024/02/Screenshot-2024-02-06-at-12.53.38-1-1024x780.png",
        imageAspectRatio: "1024/780",

        title: i18n._("Microphone Access"),
        subTitle: i18n._(
          "In the next step, you'll record audio. Please check your microphone and allow access when asked."
        ),
        listItems: [],
        buttonTitle: i18n._("Continue"),
      },

      {
        type: "record-audio",
        id: "introduce-yourself-step",
        title: i18n._("Introduce Yourself"),
        subTitle: i18n._(
          "Tell us about your background, what you've learned so far, and what you want to improve as a Junior Frontend Developer."
        ),
        buttonTitle: i18n._("Record Answer"),
        listItems: [
          {
            title: i18n._("Mention your tech stack (React/JS/HTML/CSS)"),
            iconName: "history",
          },
          { title: i18n._("Describe 1–2 small projects you've built"), iconName: "folder-code" },
          { title: i18n._("Share what you're currently learning"), iconName: "sparkles" },
        ],
      },

      {
        type: "record-audio",
        id: "technical-question-step",
        title: i18n._("Technical Question"),
        subTitle: i18n._(
          "In React, what's the difference between state and props? Give a simple example."
        ),
        buttonTitle: i18n._("Record Answer"),
        listItems: [
          {
            title: i18n._("Explain it in plain words"),
            iconName: "message-circle",
          },
          {
            title: i18n._("Give a small example (counter, input, button)"),
            iconName: "puzzle",
          },
          { title: i18n._("Mention re-render behavior briefly"), iconName: "refresh-cw" },
        ],
      },

      {
        type: "record-audio",
        id: "behavioral-question-step",
        title: i18n._("Behavioral Question"),
        subTitle: i18n._(
          "Tell about a time you were stuck on a bug. How did you find the cause and fix it?"
        ),
        buttonTitle: i18n._("Record Answer"),
        listItems: [
          {
            title: i18n._("Explain your steps (reproduce, isolate, fix, verify)"),
            iconName: "route",
          },
          {
            title: i18n._("Mention tools you used (console, DevTools, logs)"),
            iconName: "wrench",
          },
          { title: i18n._("Finish with what you learned"), iconName: "graduation-cap" },
        ],
      },

      {
        type: "analyze-inputs",
        id: "ai-feedback-step-1",
        title: i18n._("AI Feedback on Your Answers"),
        subTitle: "",
        buttonTitle: i18n._("Continue"),
        aiSystemPrompt: `Provide brief feedback on the user's answers in JSON format, focusing on fundamentals, clarity, and structure for a Junior Frontend Developer interview.

Use this JSON structure for your response:
{
  label: "Interview Readiness Score",
  totalScore: 72,
  description: "Good basics in React and JavaScript. Improve explanation clarity and give more concrete examples.",
  scoreMetrics: [
    { title: "React Fundamentals", score: 75 },
    { title: "JavaScript Basics", score: 70 },
    { title: "Problem Solving", score: 72 },
    { title: "Communication", score: 68 }
  ]
}

totalScore should be an overall score out of 100.
Each score in scoreMetrics should be between 0 and 100.
description should summarize strengths and areas for improvement.

Return only the JSON, nothing else. Your response will be passed into javascript JSON.parse() function.
`,
        aiResponseFormat: "json-scope",
      },

      {
        type: "info",
        id: "score-intro-step",
        title: i18n._("Before we start"),
        subTitle: i18n._(
          "On the next steps, you'll receive a detailed analysis of your answers and example responses to help you improve."
        ),
        imageAspectRatio: "16/9",
        listItems: [
          {
            title: i18n._("Screening interview with AI recruiter"),
            iconName: "webcam",
          },
          {
            title: i18n._("Tech interview with AI frontend developer"),
            iconName: "webcam",
          },
          {
            title: i18n._("Practical coding Q&A and debugging practice"),
            iconName: "terminal",
          },
          {
            title: i18n._("Google Calls emulator"),
            iconName: "video",
          },
          {
            title: i18n._("Corrected answers for remembering"),
            iconName: "audio-lines",
          },
        ],
        buttonTitle: i18n._("Continue"),
      },

      {
        id: "ai-practice-plant",
        type: "analyze-inputs",
        title: i18n._("Preparation plan") + " {FOR_USER_NAME}",
        subTitle: i18n._(
          "Here's a personalized training plan you'll follow. Step by step, you'll strengthen fundamentals, improve your answers, and feel more confident in junior interviews."
        ),
        buttonTitle: i18n._("Continue"),
        aiSystemPrompt: `
Your goal is to create a personalized plan for preparing for a Junior Frontend Developer interview.
Always use second-person language ("you", "your").

Below is a conversation between a student (User) and a teacher (AI Interviewer).
Based on the user's level, generate a personalized practice plan that can be completed using our AI-powered app.

Important: Do not focus on language learning, but rather on interview preparation.

Start your plan with improving interview answers (clarity + structure + examples).

Focus on fundamentals: HTML/CSS basics, JavaScript basics, React basics, debugging workflow, and small project explanations.

Finish the plan with a simple negotiation section (how to talk about junior salary expectations and growth).
`,
        aiResponseFormat: "practice-plan",
      },

      {
        type: "analyze-inputs",
        id: "ai-feedback-step-2",
        title: i18n._("AI Feedback on Your Answers"),
        subTitle: i18n._("Here's the rest of your personalized feedback to help you improve."),
        buttonTitle: i18n._("Continue"),
        aiSystemPrompt: `Provide a score breakdown of the user's answers for a Junior Frontend Developer interview, focusing on fundamentals, clarity, and structure. Return improved answers and give hints on how to answer such questions better.

For each answer, break down the score into:
- Fundamentals (0%-100%)
- Clarity (0%-100%)
- Structure (0%-100%)
- Communication (0%-100%)

Structure your response as follows:
### Question 1:
[question here]

### Answer:
[user's answer here]

### Score Breakdown:
- Fundamentals: X%
- Clarity: X%
- Structure: X%
- Communication: X%

### Improved Answer:
[improved answer here]

### Hints for Improvement:
- [hint 1]
- [hint 2]
- [hint 3]
`,
        aiResponseFormat: "markdown",
      },

      {
        type: "done",
        id: "done",
        title: i18n._("You're All Set!"),
        subTitle: i18n._(
          "Thank you for completing the Junior Frontend Developer interview prep. You can now open your dashboard and keep practicing. Good luck!"
        ),
        listItems: [],
        buttonTitle: i18n._("Open Dashboard"),
      },
    ],
  };
};
