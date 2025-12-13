import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewQuiz } from "../../types";
import { getI18nInstance } from "@/appRouterI18n";

export const getSeniorFrontendDeveloperQuizData = (lang: SupportedLanguage): InterviewQuiz => {
  const i18n = getI18nInstance(lang);

  return {
    steps: [
      {
        type: "info",
        id: "intro-step",
        imageUrl: "https://miro.medium.com/v2/resize:fit:1000/0*3MEWjTpT0sZF-LZM.png",
        imageAspectRatio: "500/190",
        title: i18n._("Welcome to Your Senior Frontend Developer Interview Prep"),
        subTitle: i18n._(
          "In this session, you'll answer questions designed for senior frontend roles. After responding, you'll receive feedback to help you refine your answers and improve your interview skills."
        ),
        buttonTitle: i18n._("Start Test"),
        listItems: [
          {
            title: i18n._("Real senior-level frontend questions"),
            iconName: "check",
          },
          { title: i18n._("AI-driven feedback on your answers"), iconName: "check" },
          { title: i18n._("Personalized improvement suggestions"), iconName: "check" },
        ],
      },
      {
        type: "info",
        id: "don-t-rush",
        imageUrl:
          "https://cdn-useast1.kapwing.com/static/templates/roll-safe-think-about-it-meme-template-regular-116fbf89.webp",
        imageAspectRatio: "500/190",
        title: i18n._("Don't Rush Your Answers"),
        subTitle: i18n._(
          "No one gets a job just because they answer quickly. Take your time to think through your responses carefully."
        ),
        buttonTitle: i18n._("Got it"),
        listItems: [
          { title: i18n._("Reflect before answering"), iconName: "brain" },
          {
            title: i18n._("You can pause and think"),
            iconName: "pause",
          },
          { title: i18n._("Re-record if needed"), iconName: "repeat" },
        ],
      },
      {
        type: "info",
        id: "mic-access-step",
        imageUrl:
          "https://circl.es/wp-content/uploads/2024/02/Screenshot-2024-02-06-at-12.53.38-1-1024x780.png",
        imageAspectRatio: "1024/780",

        title: i18n._("Enable Microphone Access"),
        subTitle: i18n._(
          "In the next step, you'll need to record audio. Please verify your microphone is ready and allow access when asked."
        ),
        listItems: [],
        buttonTitle: i18n._("Continue"),
      },
      {
        type: "record-audio",
        id: "introduce-yourself-step",
        title: i18n._("Introduce Yourself"),
        subTitle: i18n._(
          "Tell us about your background, experience, and what makes you a great Senior Frontend Developer."
        ),
        buttonTitle: i18n._("Record Answer"),
        listItems: [
          {
            title: i18n._("Highlight your frontend experience"),
            iconName: "check",
          },
          { title: i18n._("Mention key projects or achievements"), iconName: "check" },
          { title: i18n._("Keep it concise and relevant"), iconName: "check" },
        ],
      },
      {
        type: "record-audio",
        id: "technical-question-step",
        title: i18n._("Technical Question"),
        subTitle: i18n._(
          "How would you design the frontend architecture for a large-scale dashboard with real-time data updates?"
        ),
        buttonTitle: i18n._("Record Answer"),
        listItems: [
          {
            title: i18n._("Discuss component structure and state management"),
            iconName: "puzzle",
          },
          {
            title: i18n._("Address performance considerations"),
            iconName: "gauge",
          },
          { title: i18n._("Mention scalability and maintainability"), iconName: "expand" },
        ],
      },
      {
        type: "record-audio",
        id: "behavioral-question-step",
        title: i18n._("Behavioral Question"),
        subTitle: i18n._(
          "Describe a time you led a frontend refactor or migration. What challenges did you face and how did you overcome them?"
        ),
        buttonTitle: i18n._("Record Answer"),
        listItems: [
          {
            title: i18n._("Use the STAR method (Situation, Task, Action, Result)"),
            iconName: "star",
          },
          {
            title: i18n._("Highlight your leadership and problem-solving skills"),
            iconName: "users",
          },
          { title: i18n._("Be specific about your role"), iconName: "user-check" },
        ],
      },
      {
        type: "analyze-inputs",
        id: "ai-feedback-step-1",
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
      {
        type: "info",
        id: "score-intro-step",
        title: i18n._("Your Interview Readiness Score"),
        subTitle: i18n._(
          "On the next step, you'll receive a detailed analysis of your answers and example responses to help you improve."
        ),
        imageUrl:
          "https://cdn-useast1.kapwing.com/static/templates/x-x-everywhere-meme-template-full-96173e84.webp",
        imageAspectRatio: "16/9",
        listItems: [
          {
            title: i18n._("Example answers for improvement"),
            iconName: "audio-lines",
          },
          {
            title: i18n._("Suggestions to refine your next responses"),
            iconName: "file-sliders",
          },
        ],
        buttonTitle: i18n._("Continue"),
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
        id: "ai-feedback-step-2",
        title: i18n._("AI Feedback on Your Answers"),
        subTitle: i18n._("Here's the rest of your personalized feedback to help you improve."),
        buttonTitle: i18n._("Continue"),
        aiSystemPrompt: i18n._(
          `Provide a score breakdown of the user's answers, focusing on technical depth, clarity, and structure. Return improved answers and give hints on how to answer such questions better. For each answer, break down the score into Technical Depth (0%-100%), Clarity (0%-100%), Structure (0%-100%), and Communication (0%-100%). Structure your response as follows:
### Question 1: 
[question here]

### Answer:
[user's answer here]

### Score Breakdown:
- Technical Depth: X%
- Clarity: X%
- Structure: X%
- Communication: X%

### Improved Answer:
[improved answer here]

### Hints for Improvement:
- [hint 1]
- [hint 2]
- [hint 3]
`
        ),
        aiResponseFormat: "markdown",
      },
      {
        type: "info",
        id: "whats-next-step",
        title: i18n._("What's Next?"),
        subTitle: i18n._(
          "Continue practicing with more questions, track your progress, and refine your answers to ace your next interview."
        ),
        buttonTitle: i18n._("Finish"),
      },
      {
        type: "waitlist-done",
        id: "completion-step",
        title: i18n._("You're All Set!"),
        subTitle: i18n._(
          "Thank you for completing the Senior Frontend Developer interview prep. We will review your answers and get back to you with full access to the platform.\n\nYou will be notified via email once your trial is activated.\n\nFor now, you can return to the first step and practice again. It's free forever!"
        ),
        listItems: [],
        buttonTitle: i18n._("Return to Dashboard"),
      },
    ],
  };
};
