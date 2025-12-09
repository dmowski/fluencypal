import {
  CallToActionSection,
  DemoSnippetSection,
  ExampleQuestionsSection,
  FaqSection,
  FirstScreenSection,
  InfoCardsSection,
  InterviewData,
  PriceSection,
  ReviewSection,
  ScorePreviewSection,
  StepInfoCardSection,
  TechItem,
  TechStackSection,
  WhoIsThisForSection,
} from "../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import {
  Brain,
  Briefcase,
  FileText,
  MessageSquare,
  PhoneCall,
  Sparkles,
  Star,
  TrendingUp,
  Video,
  Zap,
} from "lucide-react";

export const getSeniorFrontendDeveloperData = (lang: SupportedLanguage): InterviewData => {
  const i18n = getI18nInstance(lang);

  const priceSection: PriceSection = {
    type: "price",
    title: i18n._("Choose your interview preparation plan"),
    subTitle: i18n._("Everything you need to stand out and get the job"),
    prices: [
      {
        id: "1-week-sprint",
        icon: Zap,
        badgeIcon: "⚡",
        badge: i18n._("In a hurry? Perfect for last-minute interviews"),
        label: i18n._("1-Week Sprint"),
        priceUsd: 30,
        description: i18n._(
          "Get fast, intensive preparation. Fix your biggest weaknesses in just 7 days."
        ),
        points: [
          i18n._("7 days full access"),
          i18n._("Daily AI mock interviews"),
          i18n._("Instant feedback on answers"),
          i18n._("Personalized scripts for HR and behavioral questions"),
        ],
        buttonTitle: i18n._("Start 1-Week Sprint — $30"),
      },
      {
        id: "monthly-plan",
        icon: Star,
        badgeIcon: "⭐",
        badge: i18n._("Best for most job seekers"),
        label: i18n._("Monthly Plan"),
        priceUsd: 60,
        priceLabel: i18n._("Only $2/day"),
        description: i18n._(
          "Consistent improvement with structured interview coaching and personalized practice."
        ),
        points: [
          i18n._("Full access to all simulations"),
          i18n._("Unlimited answer reviews"),
          i18n._("CV-based answer optimization"),
          i18n._("Confidence score tracking"),
          i18n._("Salary negotiation preparation"),
        ],
        buttonTitle: i18n._("Start Monthly Plan — $60"),
        isHighlighted: true,
      },
      {
        id: "4-month-plan",
        icon: Briefcase,
        badgeIcon: "🎯",
        badge: i18n._("For long job searches & career growth"),
        label: i18n._("4-Month Plan"),
        priceUsd: 90,
        description: i18n._(
          "For people preparing for multiple roles, relocating, switching careers, or targeting senior jobs."
        ),
        points: [
          i18n._("4 months full access"),
          i18n._("Long-term interview strategy"),
          i18n._("Deep skill development"),
          i18n._("Role-specific answer templates"),
          i18n._("Priority feedback queue"),
        ],
        buttonTitle: i18n._("Start 4-Month Plan — $90"),
      },
    ],
  };

  const faqSection: FaqSection = {
    type: "faq",
    title: i18n._("FAQ"),
    subTitle: i18n._("Your questions answered"),
    faqItems: [
      {
        question: i18n._("What types of frontend interviews can I practice for?"),
        answer: i18n._(
          "You can practice for senior frontend, lead, and staff-level interviews including technical rounds, frontend system design, live coding, and behavioral interviews focused on React, Vue, Angular, TypeScript, and modern web architecture."
        ),
      },
      {
        question: i18n._("How does the AI feedback work?"),
        answer: i18n._(
          "Our AI evaluates your answers for technical depth (architecture, performance, state management), clarity, structure, and communication. You receive concrete suggestions on what to add, remove, or reframe to sound like a strong senior frontend engineer."
        ),
      },
      {
        question: i18n._("Can I customize my practice sessions?"),
        answer: i18n._(
          "Yes. You can tailor sessions to your target role, tech stack (React, Vue, Angular, etc.), and seniority level. You can also focus on specific areas like system design, performance optimization, or behavioral questions."
        ),
      },
      {
        question: i18n._("Do I need to schedule time with a real interviewer?"),
        answer: i18n._(
          "No. All sessions are on-demand. You can practice anytime with AI-powered mock interviews, review feedback immediately, and repeat questions as often as you want."
        ),
      },
    ],
  };

  const stepInfoSection: StepInfoCardSection = {
    type: "stepInfoCard",
    title: i18n._("Why candidates improve so quickly"),
    subTitle: i18n._("A proven method that delivers measurable results"),
    stepInfoCards: [
      {
        icon: Video,
        label: i18n._("Step 1"),
        title: i18n._("Real interview simulation"),
        description: i18n._("Practice in real interview conditions — no tutors needed."),
      },
      {
        icon: Brain,
        label: i18n._("Step 2"),
        title: i18n._("AI feedback that matters"),
        description: i18n._("Improve your impact, structure, clarity, and delivery."),
      },
      {
        icon: FileText,
        label: i18n._("Step 3"),
        title: i18n._("Personalized answer scripts"),
        description: i18n._("Based on your CV, experience, and target role."),
      },
    ],
  };

  const reviewSection: ReviewSection = {
    type: "review",
    title: i18n._("Real people. Real job offers."),
    subTitle: i18n._("Join candidates who transformed their interview performance"),
    reviews: [
      {
        name: "Sarah M.",
        jobTitle: "Frontend Developer",
        rate: 5,
        review: i18n._(
          "I finally got 3 offers after months of silence. The React component challenges were exactly what I needed."
        ),
      },
      {
        name: "James R.",
        jobTitle: "Senior Frontend Engineer",
        rate: 5,
        review: i18n._(
          "I was confident and clear — FluencyPal prepared me better than any coach for technical discussions about state management."
        ),
      },
      {
        name: "Maria L.",
        jobTitle: "UI/UX Engineer",
        rate: 5,
        review: i18n._(
          "It helped me answer questions about accessibility and performance optimization without panic."
        ),
      },
      {
        name: "David K.",
        jobTitle: "React Developer",
        rate: 4,
        review: i18n._(
          "The personalized feedback showed me exactly what I was doing wrong in my technical explanations. Game changer."
        ),
      },
      {
        name: "Emma T.",
        jobTitle: "Frontend Tech Lead",
        rate: 5,
        review: i18n._(
          "Within 2 weeks I went from nervous to confident discussing architecture decisions. Got the job I wanted."
        ),
      },
      {
        name: "Alex P.",
        jobTitle: "Full Stack Developer",
        rate: 5,
        review: i18n._(
          "The AI feedback on my CSS and JavaScript answers was spot-on. I improved my responses immediately."
        ),
      },
    ],
  };

  const scorePreview: ScorePreviewSection = {
    type: "scorePreview",
    title: i18n._("Take the Interview Readiness Test"),
    buttonTitle: i18n._("Start Test"),
    subTitle: i18n._("In less than 5 minutes, you'll get:"),
    infoList: [
      i18n._("Personalized Interview Readiness Score"),
      i18n._("Technical analysis on system design and architecture answers"),
      i18n._("Leadership competency assessment with behavioral response feedback"),
      i18n._("Framework-specific insights (React, Vue, Angular)"),
      i18n._("Strategic action plan to address gaps in frontend architecture knowledge"),
    ],
    scorePreview: {
      label: i18n._("Interview Readiness Score"),
      totalScore: 82,
      description: i18n._(
        "Strong knowledge of React and TypeScript. Slight gaps in communication and leadership answers."
      ),
      scoreMetrics: [
        { title: i18n._("React & TypeScript"), score: 88 },
        { title: i18n._("Coding Skills"), score: 90 },
        { title: i18n._("Problem Solving"), score: 80 },
        { title: i18n._("Communication & Leadership"), score: 70 },
      ],
    },
  };

  const callToActionSection: CallToActionSection = {
    type: "callToAction",
    title: i18n._("Ready to ace your next interview?"),
    buttonTitle: i18n._("Start Your Interview Test"),
  };

  const infoCardsSection: InfoCardsSection = {
    type: "infoCards",
    title: i18n._("What you will achieve"),
    subTitle: i18n._("Real outcomes that transform your interview performance"),
    buttonTitle: i18n._("Start Your Interview Test"),
    infoCards: [
      {
        icon: MessageSquare,
        title: i18n._("Master technical leadership questions"),
        description: i18n._(
          "Demonstrate expertise in architecture decisions, code reviews, and mentoring junior developers."
        ),
      },
      {
        icon: Sparkles,
        title: i18n._("Showcase system design thinking"),
        description: i18n._(
          "Articulate scalable solutions, performance optimization, and frontend architecture patterns."
        ),
      },
      {
        icon: PhoneCall,
        title: i18n._("Stand out in behavioral rounds"),
        description: i18n._(
          "Share compelling stories about cross-team collaboration, conflict resolution, and project ownership."
        ),
      },
      {
        icon: TrendingUp,
        title: i18n._("Negotiate senior-level compensation"),
        description: i18n._(
          "Build confidence to discuss equity, benefits, and salary packages that match your experience."
        ),
      },
    ],
  };

  const firstScreenSection: FirstScreenSection = {
    type: "firstScreen",
    title: i18n._("Ace your Senior Frontend Developer interview"),
    subTitle: i18n._(
      "Practice real senior-level frontend interview questions — system design, leadership, and advanced React. Get your personalized interview action plan."
    ),
    label: i18n._("Senior Frontend Developer"),
    buttonTitle: i18n._("Start Your Interview Test"),
  };

  const reactTech: TechItem = {
    label: i18n._("React & Next.js"),
    logoUrl: "https://cdn.simpleicons.org/react",
  };

  const vueTech: TechItem = {
    label: i18n._("Vue & Pinia"),
    logoUrl: "https://cdn.simpleicons.org/vuedotjs",
  };

  const angularTech: TechItem = {
    label: i18n._("Angular & RxJS"),
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/67/Angular_gradient_logo.png",
  };

  const typescriptTech: TechItem = {
    label: i18n._("TypeScript"),
    logoUrl: "https://cdn.simpleicons.org/typescript",
  };

  const systemDesignTech: TechItem = {
    label: i18n._("Frontend System Design"),
    logoUrl: "https://cdn.simpleicons.org/lighthouse",
  };

  const microfrontendsTech: TechItem = {
    label: i18n._("Micro-frontends"),
    logoUrl: "https://cdn.simpleicons.org/webpack",
  };

  const stateManagementTech: TechItem = {
    label: i18n._("State Management"),
    logoUrl: "https://cdn.simpleicons.org/redux",
  };

  const componentLibrariesTech: TechItem = {
    label: i18n._("Component Libraries"),
    logoUrl: "https://cdn.simpleicons.org/storybook",
  };

  const renderingPerformanceTech: TechItem = {
    label: i18n._("Rendering Performance"),
    logoUrl: "https://cdn.simpleicons.org/googlechrome",
  };

  const bundlingTech: TechItem = {
    label: i18n._("Bundling & Code Splitting"),
    logoUrl: "https://cdn.simpleicons.org/rollupdotjs",
  };

  const lazyLoadingTech: TechItem = {
    label: i18n._("Lazy Loading"),
    logoUrl: "https://cdn.simpleicons.org/javascript",
  };

  const cachingTech: TechItem = {
    label: i18n._("Caching Strategies"),
    logoUrl: "https://cdn.simpleicons.org/cloudflare",
  };

  const jestTech: TechItem = {
    label: i18n._("Jest & React Testing Library"),
    logoUrl: "https://cdn.simpleicons.org/jest",
  };

  const cypressTech: TechItem = {
    label: i18n._("Cypress & E2E Testing"),
    logoUrl: "https://cdn.simpleicons.org/cypress",
  };

  const integrationTestingTech: TechItem = {
    label: i18n._("Integration Testing"),
    logoUrl: "https://cdn.simpleicons.org/githubactions",
  };

  const wcagTech: TechItem = {
    label: i18n._("WCAG Standards"),
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/51/W3C.svg",
  };

  const semanticHtmlTech: TechItem = {
    label: i18n._("Semantic HTML"),
    logoUrl: "https://cdn.simpleicons.org/html5",
  };

  const performanceMetricsTech: TechItem = {
    label: i18n._("Performance Metrics"),
    logoUrl: "https://cdn.simpleicons.org/lighthouse",
  };

  const coreWebVitalsTech: TechItem = {
    label: i18n._("Core Web Vitals"),
    logoUrl: "https://cdn.simpleicons.org/pagespeedinsights",
  };

  const exampleQuestionsSection: ExampleQuestionsSection = {
    type: "exampleQuestions",
    title: i18n._("Questions you will practice"),
    subTitle: i18n._(
      "Real Senior Frontend Developer interview questions you're likely to be asked"
    ),
    questions: [
      {
        question: i18n._(
          "How would you design the frontend architecture for a large-scale dashboard with real-time data updates?"
        ),
        techItems: [typescriptTech, systemDesignTech, stateManagementTech],
      },
      {
        question: i18n._("Explain how React reconciliation works and how it affects performance."),
        techItems: [reactTech, renderingPerformanceTech],
      },
      {
        question: i18n._(
          "How would you structure state management for a complex application with nested components and async data?"
        ),
        techItems: [stateManagementTech, reactTech, vueTech],
      },
      {
        question: i18n._(
          "Describe how you would diagnose and fix a performance regression caused by excessive re-renders."
        ),
        techItems: [renderingPerformanceTech, reactTech, angularTech],
      },
      {
        question: i18n._(
          "How do you design a reusable component library shared across multiple products or teams?"
        ),
        techItems: [componentLibrariesTech, typescriptTech, reactTech],
      },
      {
        question: i18n._(
          "Walk me through how you would improve Core Web Vitals for a slow single-page application."
        ),
        techItems: [coreWebVitalsTech, performanceMetricsTech, renderingPerformanceTech],
      },
      {
        question: i18n._(
          "How do you handle error boundaries and fallback UI in modern frontend frameworks?"
        ),
        techItems: [reactTech, vueTech, angularTech],
      },
      {
        question: i18n._(
          "Describe a time you led a frontend refactor or migration (e.g., from class components to hooks or from a legacy stack to a modern framework)."
        ),
        techItems: [reactTech, vueTech, angularTech],
      },
    ],
  };

  const techStackSection: TechStackSection = {
    type: "techStack",
    title: i18n._("Tech stack covered"),
    subTitle: i18n._("Tailored practice for your framework and seniority level"),
    keyPoints: [
      i18n._("Interview questions matched to your exact tech stack"),
      i18n._("System design scenarios used by top product companies"),
      i18n._("Performance and architecture patterns for senior roles"),
      i18n._("Real-world scenarios, not just theory"),
    ],
    techGroups: [
      {
        groupTitle: i18n._("Frameworks & Libraries"),
        items: [reactTech, vueTech, angularTech, typescriptTech],
      },
      {
        groupTitle: i18n._("Architecture & Design"),
        items: [systemDesignTech, microfrontendsTech, stateManagementTech, componentLibrariesTech],
      },
      {
        groupTitle: i18n._("Performance & Optimization"),
        items: [renderingPerformanceTech, bundlingTech, lazyLoadingTech, cachingTech],
      },
      {
        groupTitle: i18n._("Testing & Quality"),
        items: [jestTech, cypressTech, integrationTestingTech],
      },
      {
        groupTitle: i18n._("UX & Accessibility"),
        items: [wcagTech, semanticHtmlTech, performanceMetricsTech, coreWebVitalsTech],
      },
    ],
  };

  const whoIsThisForSection: WhoIsThisForSection = {
    type: "whoIsThisFor",
    title: i18n._("Who this is for"),
    subTitle: i18n._("Designed specifically for experienced frontend engineers"),
    audienceItems: [
      i18n._("Senior Frontend Developers preparing for promotions or new roles"),
      i18n._("Frontend engineers interviewing for Senior, Lead, or Staff positions"),
      i18n._("React, Vue, or Angular specialists facing architecture and system design rounds"),
      i18n._(
        "Engineers switching from mid-level to senior roles and needing stronger behavioral stories"
      ),
      i18n._(
        "Developers targeting product companies with complex frontends and high performance requirements"
      ),
      i18n._(
        "Candidates who already know the basics but struggle to articulate decisions clearly in interviews"
      ),
    ],
  };

  const demoSnippetSection: DemoSnippetSection = {
    type: "demoSnippet",
    title: i18n._("See the type of feedback you'll get"),
    subTitle: i18n._("Precise, actionable insights instead of generic comments"),
    demoItems: [
      {
        question: i18n._("How would you improve the performance of a React app that feels slow?"),
        userAnswerShort: i18n._(
          "I would use React.memo and lazy loading to reduce unnecessary renders."
        ),
        feedback: i18n._(
          "Good direction, but your answer is too shallow for a senior role. Mention measuring first (profiling with React DevTools and the browser Performance panel), then specific bottlenecks (large bundles, unnecessary network calls, expensive components). Strengthen your answer by adding concrete techniques: code splitting via dynamic imports, memoizing expensive selectors, virtualization for long lists, and leveraging browser caching and a CDN. Close with how you'd monitor improvements over time."
        ),
      },
      {
        question: i18n._(
          "How would you design the frontend architecture for a large multi-page product?"
        ),
        userAnswerShort: i18n._(
          "I would split the app into reusable components and use a global store for state."
        ),
        feedback: i18n._(
          "For a senior-level interview, you should go beyond 'components + global store'. Talk about module boundaries (feature-based folders, domain-driven slices), isolated design systems, clear contracts between API and UI, and how you avoid tight coupling. Mention decisions around routing, data-fetching strategy (for example React Query or SWR), error handling, and how you'd support gradual refactors or micro-frontend approaches. This shows you think like an architect, not just an implementer."
        ),
      },
    ],
  };

  return {
    coreData: {
      id: "senior-frontend-developer",
      jobTitle: i18n._("Senior Frontend Developer"),
      title: i18n._("Senior Frontend Developer interview prep that gets you more offers"),
      subTitle: i18n._(
        "Practice real Senior Frontend Developer interview questions and get a personalized action plan to fix your gaps before the next interview."
      ),
      keywords: [
        i18n._("senior frontend interview"),
        i18n._("senior frontend developer interview"),
        i18n._("frontend developer interview prep"),
        i18n._("react interview questions"),
        i18n._("frontend system design interview"),
        i18n._("web developer interview preparation"),
      ],
      category: {
        categoryTitle: i18n._("IT & Software Development"),
        categoryId: "it",
      },
    },

    sections: [
      firstScreenSection,
      infoCardsSection,
      scorePreview,
      stepInfoSection,
      reviewSection,
      exampleQuestionsSection,
      techStackSection,
      whoIsThisForSection,
      demoSnippetSection,
      priceSection,
      faqSection,
      callToActionSection,
    ],

    quiz: {
      steps: [
        {
          type: "info",
          id: "intro-step",
          imageUrl: "/interview/zero.png",
          title: i18n._("Welcome to your Senior Frontend Developer Interview Prep"),
          subTitle: i18n._(
            "In this session, you'll answer questions designed for senior frontend roles. After responses, you'll receive  feedback to help you refine your answers and improve your interview skills."
          ),
          buttonTitle: i18n._("Start Interview Prep"),
          listItems: [],
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
        // * RecordAudioQuizStep - Ask another question and record audio (Technical question)
        {
          type: "record-audio",
          id: "technical-question-step",
          title: i18n._("Technical Question"),
          subTitle: i18n._(
            "How would you design the frontend architecture for a large-scale dashboard with real-time data updates?"
          ),
          buttonTitle: i18n._("Record Answer"),
          listItems: [],
        },
        // * RecordAudioQuizStep - Ask another question and record audio (Behavioral question)
        {
          type: "record-audio",
          id: "behavioral-question-step",
          title: i18n._("Behavioral Question"),
          subTitle: i18n._(
            "Describe a time you led a frontend refactor or migration. What challenges did you face and how did you overcome them?"
          ),
          buttonTitle: i18n._("Record Answer"),
          listItems: [],
        },
        // * AnalyzeInputsQuizStep - show AI analysis of user's answers (Markdown)
        {
          type: "analyze-inputs",
          id: "ai-feedback-step-1",
          title: i18n._("AI Feedback on Your Answers"),
          subTitle: i18n._("Here's personalized feedback on your responses to help you improve."),
          buttonTitle: i18n._("Continue"),
          aiSystemPrompt: i18n._(
            "Provide short feedback on the user's answers, focusing on technical depth, clarity, and structure. Suggest places that could be improved."
          ),
          aiResponseFormat: "markdown",
        },
        // * InfoQuizStep - On the next step, you will see score analysis
        {
          type: "info",
          id: "score-intro-step",
          title: i18n._("Next: Your Interview Readiness Score"),
          subTitle: i18n._(
            "On the next step, you'll receive a score analysis of your answers and example answers to help you improve."
          ),
          imageUrl: "https://media.tenor.com/IL7UVyrF94oAAAAM/so-whats-the-next-step-cleo.gif",
          listItems: [
            {
              title: i18n._("Detailed score breakdown"),
              iconName: "chart-line",
            },
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

        // PaywallQuizStep - show paywall to verify credit card, choosing a plan and actual payment will be done later if user proceeds
        {
          type: "paywall",
          id: "upgrade-step",
          title: i18n._("Unlock Your Trial and get Full Feedback"),
          subTitle: i18n._("No payment required after trial. You decide when to pay."),
          listItems: [],
          buttonTitle: i18n._("Start Trial"),
        },
        // AnalyzeInputsQuizStep - show AI analysis of the rest user's answers
        {
          type: "analyze-inputs",
          id: "ai-feedback-step-2",
          title: i18n._("Complete AI Feedback on Your Answers"),
          subTitle: i18n._("Here's the rest of your personalized feedback to help you improve."),
          buttonTitle: i18n._("Continue"),
          aiSystemPrompt: i18n._(
            `Provide score breakdown on the user's answers, focusing on technical depth, clarity, and structure. Return improved answers. And give hints on how to answer such questions better. For each answer break down the score into Technical Depth (0%-100%), Clarity (0%-100%), Structure (0%-100%), and Communication (0%-100%). Structure of your answer:
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
        // InfoQuizStep - What's next: feature list of the app
        {
          type: "info",
          id: "whats-next-step",
          title: i18n._("What's Next?"),
          subTitle: i18n._(
            "Continue practicing with more questions, track your progress, and refine your answers to ace your next interview."
          ),
          buttonTitle: i18n._("Finish"),
        },
        // * WaitlistDoneQuizStep - final step indicating completion
        {
          type: "waitlist-done",
          id: "completion-step",
          title: i18n._("You're All Set!"),
          subTitle: i18n._(
            "Thank you for completing the Senior Frontend Developer interview prep. We will review your answer and get back to you with full access to the platform."
          ),
          listItems: [],
          buttonTitle: i18n._("Return to Dashboard"),
        },
      ],
    },
  };
};
