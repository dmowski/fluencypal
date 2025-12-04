import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { InterviewCategory, InterviewData } from "./types";
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

export interface InterviewAllData {
  interviews: InterviewData[];
  categoriesList: InterviewCategory[];
  allCategory: InterviewCategory;
}

export const getAllInterviews = (lang: SupportedLanguage): InterviewAllData => {
  const i18n = getI18nInstance(lang);
  const list: InterviewData[] = [
    {
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
            "I was confident and clear — FluentlyPal prepared me better than any coach for technical discussions about state management.",
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
    },

    /*{
      id: "junior-frontend-developer",
      jobTitle: i18n._("Junior Frontend Developer"),
      title: i18n._("Junior Frontend Developer Interview"),
      subTitle: i18n._(
        "Get ready for fundamental HTML, CSS, JavaScript, and problem-solving interviews."
      ),
      keywords: [
        i18n._("junior frontend interview"),
        i18n._("entry level frontend questions"),
        i18n._("frontend basics interview"),
      ],
      category: {
        categoryTitle: i18n._("IT & Software Development"),
        categoryId: "it",
      },
    },

    {
      id: "csharp-backend-developer",
      title: i18n._("C# Backend Developer Interview"),
      jobTitle: i18n._("C# Backend Developer"),
      subTitle: i18n._(
        "Prepare for .NET, APIs, databases, multithreading, and system design questions."
      ),
      keywords: [
        i18n._("c# backend interview"),
        i18n._(".net interview questions"),
        i18n._("asp.net core interview prep"),
        i18n._("csharp developer interview"),
      ],
      category: {
        categoryTitle: i18n._("IT & Software Development"),
        categoryId: "it",
      },
    },

    {
      id: "node-backend-developer",
      title: i18n._("Node.js Backend Developer Interview"),
      jobTitle: i18n._("Node.js Backend Developer"),
      subTitle: i18n._(
        "Ace Node.js interviews covering async patterns, APIs, microservices, and databases."
      ),
      keywords: [
        i18n._("node.js interview prep"),
        i18n._("node backend interview"),
        i18n._("javascript backend interview"),
        i18n._("express.js interview questions"),
      ],
      category: {
        categoryTitle: i18n._("IT & Software Development"),
        categoryId: "it",
      },
    },

    {
      id: "java-backend-developer",
      title: i18n._("Java Backend Developer Interview"),
      jobTitle: i18n._("Java Backend Developer"),
      subTitle: i18n._(
        "Prepare for Java, Spring Boot, concurrency, design patterns, and system design."
      ),
      keywords: [
        i18n._("java interview preparation"),
        i18n._("spring boot interview"),
        i18n._("java backend interview"),
        i18n._("java developer questions"),
      ],
      category: {
        categoryTitle: i18n._("IT & Software Development"),
        categoryId: "it",
      },
    },

    {
      id: "python-backend-developer",
      jobTitle: i18n._("Python Backend Developer"),
      title: i18n._("Python Backend Developer Interview"),
      subTitle: i18n._(
        "Get ready for Python, Django/Flask, algorithms, and backend architecture questions."
      ),
      keywords: [
        i18n._("python backend interview"),
        i18n._("django interview questions"),
        i18n._("flask interview prep"),
        i18n._("python developer interview"),
      ],
      category: {
        categoryTitle: i18n._("IT & Software Development"),
        categoryId: "it",
      },
    },

    {
      id: "fullstack-developer",
      title: i18n._("Full-Stack Developer Interview"),
      jobTitle: i18n._("Full-Stack Developer"),
      subTitle: i18n._("Prepare for both frontend and backend interview challenges."),
      keywords: [
        i18n._("fullstack interview"),
        i18n._("full stack developer questions"),
        i18n._("javascript interview prep"),
      ],
      category: {
        categoryTitle: i18n._("IT & Software Development"),
        categoryId: "it",
      },
    },

    {
      id: "devops-engineer",
      title: i18n._("DevOps Engineer Interview Preparation"),
      jobTitle: i18n._("DevOps Engineer"),
      subTitle: i18n._("Master CI/CD, cloud, and infrastructure interview topics."),
      keywords: [
        i18n._("devops interview"),
        i18n._("ci cd interview questions"),
        i18n._("cloud engineer interview prep"),
      ],
      category: {
        categoryTitle: i18n._("IT & Software Development"),
        categoryId: "it",
      },
    },

    {
      id: "qa-engineer",
      title: i18n._("QA Engineer Interview Preparation"),
      jobTitle: i18n._("QA Engineer"),
      subTitle: i18n._("Prepare for manual and automation testing interview questions."),
      keywords: [
        i18n._("qa interview"),
        i18n._("software testing interview"),
        i18n._("qa automation interview prep"),
      ],
      category: {
        categoryTitle: i18n._("IT & Software Development"),
        categoryId: "it",
      },
    },

    {
      id: "product-manager",
      title: i18n._("Product Manager Interview"),
      jobTitle: i18n._("Product Manager"),
      subTitle: i18n._("Practice product sense, strategy, and execution questions."),
      keywords: [
        i18n._("product manager interview"),
        i18n._("pm interview prep"),
        i18n._("product sense practice"),
      ],
      category: {
        categoryTitle: i18n._("Product & Management"),
        categoryId: "management",
      },
    },

    /*{
      id: "project-manager",
      title: i18n._("Project Manager Interview"),
      subTitle: i18n._("Prepare for communication, planning, and leadership questions."),
      keywords: [
        i18n._("project manager interview"),
        i18n._("pmp interview prep"),
        i18n._("project coordination interview"),
      ],
      category: {
        categoryTitle: i18n._("Product & Management"),
        categoryId: "management",
      },
    },

    {
      id: "hr-generalist",
      title: i18n._("HR Generalist Interview Preparation"),
      subTitle: i18n._("Get ready for HR operations, behavioral, and recruiting questions."),
      keywords: [
        i18n._("hr interview preparation"),
        i18n._("hr generalist questions"),
        i18n._("human resources interview prep"),
      ],
      category: {
        categoryTitle: i18n._("HR & Recruiting"),
        categoryId: "hr",
      },
    },

    {
      id: "recruiter-interview",
      title: i18n._("Recruiter & Talent Acquisition Interview"),
      subTitle: i18n._("Practice sourcing, candidate experience, and stakeholder management."),
      keywords: [
        i18n._("recruiter interview prep"),
        i18n._("talent acquisition interview"),
        i18n._("sourcing interview questions"),
      ],
      category: {
        categoryTitle: i18n._("HR & Recruiting"),
        categoryId: "hr",
      },
    },

    {
      id: "customer-support",
      title: i18n._("Customer Support Interview Preparation"),
      subTitle: i18n._("Practice communication, empathy, and call-handling questions."),
      keywords: [
        i18n._("customer support interview"),
        i18n._("call center interview"),
        i18n._("support agent interview prep"),
      ],
      category: {
        categoryTitle: i18n._("Service & Communication"),
        categoryId: "service",
      },
    },

    {
      id: "sales-representative",
      title: i18n._("Sales Representative Interview"),
      subTitle: i18n._("Prepare for persuasion, objection handling, and sales scenario questions."),
      keywords: [
        i18n._("sales interview prep"),
        i18n._("sales rep interview"),
        i18n._("sales objections interview"),
      ],
      category: {
        categoryTitle: i18n._("Sales & Marketing"),
        categoryId: "sales",
      },
    },

    {
      id: "account-manager",
      title: i18n._("Account Manager Interview Preparation"),
      subTitle: i18n._("Practice client communication, upselling, and conflict resolution."),
      keywords: [
        i18n._("account manager interview"),
        i18n._("client management questions"),
        i18n._("customer success interview prep"),
      ],
      category: {
        categoryTitle: i18n._("Sales & Marketing"),
        categoryId: "sales",
      },
    },

    {
      id: "marketing-specialist",
      title: i18n._("Marketing Specialist Interview"),
      subTitle: i18n._("Prepare for campaign analysis, metrics, and creativity questions."),
      keywords: [
        i18n._("marketing interview prep"),
        i18n._("digital marketing interview"),
        i18n._("marketing specialist interview"),
      ],
      category: {
        categoryTitle: i18n._("Sales & Marketing"),
        categoryId: "sales",
      },
    },

    {
      id: "business-analyst",
      title: i18n._("Business Analyst Interview Preparation"),
      subTitle: i18n._(
        "Practice analytical thinking, requirements, and stakeholder communication."
      ),
      keywords: [
        i18n._("business analyst interview"),
        i18n._("ba interview prep"),
        i18n._("requirements analysis interview"),
      ],
      category: {
        categoryTitle: i18n._("Business & Analytics"),
        categoryId: "business",
      },
    },

    {
      id: "data-analyst",
      title: i18n._("Data Analyst Interview Preparation"),
      subTitle: i18n._("Get ready for SQL, business case, and metric analysis interviews."),
      keywords: [
        i18n._("data analyst interview"),
        i18n._("sql interview prep"),
        i18n._("analytics interview preparation"),
      ],
      category: {
        categoryTitle: i18n._("Business & Analytics"),
        categoryId: "business",
      },
    },

    {
      id: "operations-manager",
      title: i18n._("Operations Manager Interview"),
      subTitle: i18n._("Prepare for people management, optimization, and crisis scenarios."),
      keywords: [
        i18n._("operations manager interview"),
        i18n._("ops interview questions"),
        i18n._("operations interview prep"),
      ],
      category: {
        categoryTitle: i18n._("Business & Analytics"),
        categoryId: "business",
      },
    },

    {
      id: "junior-job-seeker",
      title: i18n._("Junior Interview Preparation"),
      subTitle: i18n._("Get ready for your very first interviews with confidence."),
      keywords: [
        i18n._("junior interview prep"),
        i18n._("entry level interview questions"),
        i18n._("first job interview help"),
      ],
      category: {
        categoryTitle: i18n._("Career Start"),
        categoryId: "career",
      },
    },

    {
      id: "senior-leadership",
      title: i18n._("Senior & Leadership Interview Preparation"),
      subTitle: i18n._("Prepare for decision-making, leadership, and strategy-focused questions."),
      keywords: [
        i18n._("senior interview prep"),
        i18n._("leadership interview questions"),
        i18n._("executive interview practice"),
      ],
      category: {
        categoryTitle: i18n._("Leadership"),
        categoryId: "leadership",
      },
    },

    {
      id: "career-switch",
      title: i18n._("Interview Preparation for Career Switchers"),
      subTitle: i18n._("Learn how to explain your motivation and position yourself strongly."),
      keywords: [
        i18n._("career change interview"),
        i18n._("career switch interview prep"),
        i18n._("change field job interview"),
      ],
      category: {
        categoryTitle: i18n._("Career Change"),
        categoryId: "career-change",
      },
    },*/
  ];

  const categoriesList: InterviewCategory[] = [];

  list.forEach((item) => {
    const category = item.category;
    if (!categoriesList.find((cat) => cat.categoryId === category.categoryId)) {
      categoriesList.push(category);
    }
  });

  const allCategory = {
    categoryTitle: i18n._(`All Interviews`),
    categoryId: "all",
    isAllResources: true,
  };

  categoriesList.unshift(allCategory);

  return { interviews: list, allCategory, categoriesList };
};
