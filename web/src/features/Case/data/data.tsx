import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';
import { InterviewCategory, InterviewData } from '../types';
import getFrontendLandingData from './frontend-senior/landing';
import getJuniorFrontendLandingData from './frontend-junior/landing';
import getCsharpBackendDeveloperData from './backendCSharp/landing';

export interface InterviewAllData {
  interviews: InterviewData[];
  categoriesList: InterviewCategory[];
  allCategory: InterviewCategory;
}

export const getAllInterviews = (lang: SupportedLanguage): InterviewAllData => {
  const i18n = getI18nInstance(lang);
  const list: InterviewData[] = [
    getFrontendLandingData(lang),
    getCsharpBackendDeveloperData(lang),
    getJuniorFrontendLandingData(lang),

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
    const category = item.coreData.category;
    if (!categoriesList.find((cat) => cat.categoryId === category.categoryId)) {
      categoriesList.push(category);
    }
  });

  const allCategory = {
    categoryTitle: i18n._(`All Interviews`),
    categoryId: 'all',
    isAllResources: true,
  };

  categoriesList.unshift(allCategory);

  return { interviews: list, allCategory, categoriesList };
};
