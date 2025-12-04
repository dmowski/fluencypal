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
        badge: "In a hurry? Perfect for last-minute interviews",
        label: "1-Week Sprint",
        priceUsd: 30,
        description: "Get fast, intensive preparation. Fix your top weaknesses in just 7 days.",
        points: [
          "7 days full access",
          "Daily AI mock interviews",
          "Instant feedback on answers",
          "Personalized scripts for HR & behavioral questions",
        ],
        buttonTitle: "Start 1-Week Sprint — $30",
      },
      {
        id: "monthly-plan",
        icon: Star,
        badgeIcon: "⭐",
        badge: "Best for most job seekers",
        label: "Monthly Plan",
        priceUsd: 60,
        priceLabel: "Only $2/day",
        description:
          "Consistent improvement with structured interview coaching and personalized practice.",
        points: [
          "Full access to all simulations",
          "Unlimited answer reviews",
          "CV-based answer optimization",
          "Confidence score tracking",
          "Salary negotiation preparation",
        ],
        buttonTitle: "Start Monthly Plan — $60",
        isHighlighted: true,
      },
      {
        id: "4-month-plan",
        icon: Briefcase,
        badgeIcon: "🎯",
        badge: "For long job searches & career growth",
        label: "4-Month Plan",
        priceUsd: 90,
        description:
          "For people preparing for multiple roles, relocating, switching careers, or targeting senior jobs.",
        points: [
          "4 months full access",
          "Long-term interview strategy",
          "Deep skill development",
          "Role-specific answer templates",
          "Priority feedback queue",
        ],
        buttonTitle: "Start 4-Month Plan — $90",
      },
    ],
  };

  const faqSection: FaqSection = {
    type: "faq",
    title: i18n._("FAQ"),
    subTitle: i18n._("Your questions answered"),
    faqItems: [
      {
        question: i18n._(`What types of frontend interviews can I practice for?`),
        answer: i18n._(
          `We support various interview formats including behavioral interviews, technical interviews, system design, and role-specific scenarios across multiple industries and job levels.`
        ),
      },
      {
        question: i18n._(`How does the AI feedback work?`),
        answer: i18n._(
          `Our AI analyzes your answers for clarity, structure, technical accuracy, and communication skills. You'll receive detailed feedback and suggestions to improve your responses effectively.`
        ),
      },
      {
        question: i18n._(`Can I customize my practice sessions?`),
        answer: i18n._(
          `Yes! You can tailor your practice sessions based on specific job titles, companies, and industries. Our AI adapts questions to match the interviewing style of your target employers.`
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
        label: i18n._("Step 2"),
        title: i18n._("Personalized answer scripts"),
        description: i18n._("Based on your CV, experience, and target role."),
      },
    ],
  };

  const reviewSection: ReviewSection = {
    type: "review",
    title: i18n._("Real people. Real job offers."),
    subTitle: i18n._("Join thousands who transformed their interview performance"),
    reviews: [
      {
        name: "Sarah M.",
        jobTitle: "Frontend Developer",
        rate: 5,
        review:
          "I finally got 3 offers after months of silence. The React component challenges were exactly what I needed.",
      },
      {
        name: "James R.",
        jobTitle: "Senior Frontend Engineer",
        rate: 5,
        review:
          "I was confident and clear — FluencyPal prepared me better than any coach for technical discussions about state management.",
      },
      {
        name: "Maria L.",
        jobTitle: "UI/UX Engineer",
        rate: 5,
        review:
          "It helped me answer questions about accessibility and performance optimization without panic.",
      },
      {
        name: "David K.",
        jobTitle: "React Developer",
        rate: 4,
        review:
          "The personalized feedback showed me exactly what I was doing wrong in my technical explanations. Game changer.",
      },
      {
        name: "Emma T.",
        jobTitle: "Frontend Tech Lead",
        rate: 5,
        review:
          "Within 2 weeks I went from nervous to confident discussing architecture decisions. Got the job I wanted.",
      },
      {
        name: "Alex P.",
        jobTitle: "Full Stack Developer",
        rate: 5,
        review:
          "The AI feedback on my CSS and JavaScript answers was spot-on. I improved my responses immediately.",
      },
    ],
  };

  const scorePreview: ScorePreviewSection = {
    type: "scorePreview",
    title: i18n._("Take the Interview Readiness Test"),
    buttonTitle: i18n._("Start Test"),
    subTitle: i18n._("In less then 5 minutes, you'll get:"),
    infoList: [
      i18n._("Personalized Interview Readiness Score"),
      i18n._("Technical analysis on system design and architecture answers"),
      i18n._("Leadership competency assessment with behavioral response feedback"),
      i18n._("Framework-specific insights (React, Vue, Angular)"),
      i18n._("Strategic action plan to address gaps in frontend architecture knowledge"),
    ],
    scorePreview: {
      label: "Interview Readiness Score",
      totalScore: 85,
      description:
        "Strong knowledge of TypeScript and Angular.js. It might be worth polishing Soft Skills.",

      scoreMetrics: [
        { title: "Angular.js knowledge", score: 85 },
        { title: "Coding Skills", score: 90 },
        { title: "Problem Solving", score: 80 },
        { title: "Communication", score: 25 },
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
    title: i18n._("Get more job offers with  answers that stand out"),
    subTitle: i18n._(
      "Prepare for system design, leadership, and advanced frontend questions. Get your personalized interview action plan"
    ),
    label: i18n._("Senior Frontend Developer"),
    buttonTitle: i18n._("Start Your Interview Test"),
  };

  const exampleQuestionsSection: ExampleQuestionsSection = {
    type: "exampleQuestions",
    title: i18n._("Questions you will practice"),
    subTitle: i18n._("Real senior frontend interview questions you are likely to get asked"),
    questions: [
      i18n._(
        "How would you design the frontend architecture for a large-scale dashboard with real-time data updates?"
      ),
      i18n._("Explain how React reconciliation works and how it affects performance."),
      i18n._(
        "How would you structure state management for a complex application with nested components and async data?"
      ),
      i18n._(
        "Describe how you would diagnose and fix a performance regression caused by excessive re-renders."
      ),
      i18n._(
        "How do you design a reusable component library shared across multiple products or teams?"
      ),
      i18n._(
        "Walk me through how you would improve Core Web Vitals for a slow single-page application."
      ),
      i18n._("How do you handle error boundaries and fallback UI in modern frontend frameworks?"),
      i18n._(
        "Describe a time you led a frontend refactor or migration (e.g., from class components to hooks or from legacy stack to modern framework)."
      ),
    ],
  };

  const techStackSection: TechStackSection = {
    type: "techStack",
    title: i18n._("Tech stack covered"),
    subTitle: i18n._("Tailored practice for your framework and seniority level"),
    techItems: [
      i18n._("React, Next.js and modern React patterns (hooks, context, Suspense)"),
      i18n._("TypeScript for robust, large-scale frontend codebases"),
      i18n._("Vue and Vuex / Pinia state management patterns"),
      i18n._("Angular and RxJS-driven architectures"),
      i18n._("Frontend system design and architecture for SPAs and micro-frontends"),
      i18n._("Performance optimization: rendering, bundling, caching, lazy loading"),
      i18n._("Testing: Jest, React Testing Library, Cypress and integration testing"),
      i18n._("Accessibility, UX standards and best practices for production apps"),
    ],
  };

  const whoIsThisForSection: WhoIsThisForSection = {
    type: "whoIsThisFor",
    title: i18n._("Who this is for"),
    subTitle: i18n._("Designed specifically for experienced frontend engineers"),
    audienceItems: [
      i18n._("Senior Frontend Developers preparing for promotions or new roles"),
      i18n._("Frontend engineers interviewing for Senior / Lead / Staff positions"),
      i18n._("React / Vue / Angular specialists facing architecture and system design rounds"),
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
        label: i18n._("Example insight – performance"),
        question: i18n._("How would you improve the performance of a React app that feels slow?"),
        userAnswerShort: i18n._(
          "I would use React.memo and lazy loading to reduce unnecessary renders."
        ),
        feedback: i18n._(
          "Good direction, but your answer is too shallow for a senior role. Mention measuring first (profiling with React DevTools and browser Performance panel), then specific bottlenecks (large bundles, unnecessary network calls, expensive components). Strengthen your answer by adding concrete techniques: code splitting via dynamic imports, memoizing expensive selectors, virtualization for long lists, and leveraging browser caching and a CDN. Close with how you'd monitor improvements over time."
        ),
      },
      {
        label: i18n._("Example insight – architecture"),
        question: i18n._(
          "How would you design the frontend architecture for a large multi-page product?"
        ),
        userAnswerShort: i18n._(
          "I would split the app into reusable components and use a global store for state."
        ),
        feedback: i18n._(
          "For a senior-level interview, you should go beyond 'components + global store'. Talk about module boundaries (feature-based folders, domain-driven slices), isolated design systems, clear contracts between API and UI, and how you avoid tight coupling. Mention decisions around routing, data-fetching strategy (e.g., React Query or SWR), error handling, and how you'd support gradual refactors or micro-frontend approaches. This shows you think like an architect, not just an implementer."
        ),
      },
    ],
  };

  return {
    id: "senior-frontend-developer",
    jobTitle: i18n._("Senior Frontend Developer"),
    title: i18n._("Get more job offers with  answers that stand out"),
    subTitle: i18n._(
      "Prepare for system design, leadership, and advanced frontend questions. Get your personalized interview action plan"
    ),

    keywords: [
      i18n._("senior frontend interview"),
      i18n._("frontend developer interview prep"),
      i18n._("react interview questions"),
      i18n._("web developer interview preparation"),
    ],
    category: {
      categoryTitle: i18n._("IT & Software Development"),
      categoryId: "it",
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
  };
};
