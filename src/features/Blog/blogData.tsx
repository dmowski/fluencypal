import { SupportedLanguage } from "@/common/lang";
import { BlogPost } from "./types";
import { getI18nInstance } from "@/appRouterI18n";

export const getBlogs: (lang: SupportedLanguage) => Array<BlogPost> = (lang) => {
  const i18n = getI18nInstance(lang);
  return [
    {
      id: "15-business-english-phrases-interview",
      title: i18n._("15 Must-Know Business English Phrases to Ace Your Next Job Interview"),
      subTitle: i18n._(
        "Master these essential phrases and boost your confidence in any professional interview setting."
      ),
      keywords: [
        i18n._("Business English"),
        i18n._("Interview English"),
        i18n._("Job Interview Tips"),
        i18n._("English for Professionals"),
        i18n._("FluencyPal"),
        i18n._("Intermediate English Learners"),
      ],
      content: i18n._(
        `Walking into a job interview can feel intimidating, especially when English is your second language. But with the right preparation, you can confidently navigate the conversation and impress your interviewer. Here are 15 essential Business English phrases you should know to excel in your next interview.
  
## Professional Greetings
Start strong and polite:
- "I'm pleased to meet you."
- "Thank you for taking the time to meet with me today."

## Describing Your Background
Clearly communicate your experience:
- "I have a background in [industry] with [number] years of experience."
- "In my previous role at [company], I managed [specific responsibilities]."

## Highlighting Your Strengths
Showcase your skills confidently:
- "My strengths include [skill] and [skill]."
- "I'm skilled at [skill], which helped me achieve [specific accomplishment]."

## Addressing Weaknesses Positively
Handle challenging questions gracefully:
- "One area I'm working to improve is [weakness], and I've taken steps by [action]."

## Expressing Interest and Enthusiasm
Demonstrate genuine passion for the role:
- "This role aligns perfectly with my passion for [area or skill]."
- "I'm excited about the opportunity to contribute to [company name]."

## Asking Smart Questions
Show engagement and interest:
- "Could you tell me more about the team I'd be working with?"
- "How do you measure success in this role?"

## Concluding the Interview
Leave a lasting positive impression:
- "Thank you very much for your time. It was a pleasure speaking with you."
- "I look forward to hearing from you soon."

## Ready to Practice?
The best way to master these phrases is by practicing them in realistic scenarios. FluencyPal’s AI-powered mock interviews provide real-time feedback, helping you perfect your responses and gain the confidence you need to succeed. Why not start practicing today?`
      ),
      imagePreviewUrl: "https://cdn.midjourney.com/a26866e1-112d-45bd-a1b0-d6ae78b53ac6/0_2.png",
      publishedAt: Date.now(),
      category: i18n._("Business English"),
    },
  ];
};
