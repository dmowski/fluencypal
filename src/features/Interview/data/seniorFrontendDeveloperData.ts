import { InterviewData } from "../types";
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
    whatUserGetAfterFirstTest: [
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
    reviewsData: [
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
    price: [
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
    landingMessages: {
      startYourInterviewTest: i18n._("Start Your Interview Test"),
      whatYouWillAchieve: i18n._("What you will achieve"),
      realOutcomesThatTransform: i18n._("Real outcomes that transform your interview performance"),
      startFreeTrial: i18n._("Start Free Trial"),
      takeTheInterviewReadinessTest: i18n._("Take the Interview Readiness Test"),
      inLessThen5Minutes: i18n._("In less then 5 minutes, you'll get:"),
      startTest: i18n._("Start Test"),
      whyCandidatesImprove: i18n._("Why candidates improve so quickly"),
      aProvenMethodThatDelivers: i18n._("A proven method that delivers measurable results"),
      realPeopleRealJobOffers: i18n._("Real people. Real job offers."),
      joinThousandsWhoTransformed: i18n._("Join thousands who transformed their interview performance"),
      chooseYourInterviewPreparationPlan: i18n._("Choose your interview preparation plan"),
      everythingYouNeedToStandOut: i18n._("Everything you need to stand out and get the job"),
      allPlansIncludeInstantAccess: i18n._("All plans include instant access • No commitment • Secure payment"),
      faq: i18n._("FAQ"),
      readyToAceYourNextInterview: i18n._("Ready to ace your next interview?"),
      startPracticingNow: i18n._("Start Practicing Now"),
    },
  };
};
