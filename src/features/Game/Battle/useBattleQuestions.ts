import { useLingui } from "@lingui/react";
import { BattleQuestion } from "./types";

export const useBattleQuestions = () => {
  const i18n = useLingui();

  const questions: Record<string, BattleQuestion> = {
    q1: {
      topic: i18n._("Remote Work"),
      description: i18n._(
        "Is remote work better for productivity than working in an office? Why or why not?"
      ),
    },
    q2: {
      topic: i18n._("Artificial Intelligence"),
      description: i18n._(
        "Should AI be allowed to replace humans in creative jobs like writing or design?"
      ),
    },
    q3: {
      topic: i18n._("Education"),
      description: i18n._("Is a university degree still necessary for career success today?"),
    },
    q4: {
      topic: i18n._("Social Media"),
      description: i18n._("Does social media do more harm than good for society?"),
    },
    q5: {
      topic: i18n._("Work-Life Balance"),
      description: i18n._("Should companies be responsible for employees’ mental health?"),
    },

    q6: {
      topic: i18n._("Technology"),
      description: i18n._("Does technology make people more connected or more lonely?"),
    },
    q7: {
      topic: i18n._("Career"),
      description: i18n._("Is it better to specialize deeply in one skill or stay a generalist?"),
    },
    q8: {
      topic: i18n._("Money"),
      description: i18n._("Does money bring freedom, happiness, or neither?"),
    },
    q9: {
      topic: i18n._("Leadership"),
      description: i18n._("Are great leaders born or made?"),
    },
    q10: {
      topic: i18n._("Failure"),
      description: i18n._("Is failure a necessary part of success?"),
    },

    q11: {
      topic: i18n._("AI Ethics"),
      description: i18n._("Should AI systems be required to explain how they make decisions?"),
    },
    q12: {
      topic: i18n._("Education"),
      description: i18n._("Should schools focus more on practical skills than theory?"),
    },
    q13: {
      topic: i18n._("Work Culture"),
      description: i18n._("Is working long hours a sign of ambition or poor time management?"),
    },
    q14: {
      topic: i18n._("Success"),
      description: i18n._("How should success be measured: money, impact, or happiness?"),
    },
    q15: {
      topic: i18n._("Communication"),
      description: i18n._("Is honest communication always the best policy?"),
    },

    q16: {
      topic: i18n._("AI in Daily Life"),
      description: i18n._("Would you trust AI to make important life decisions for you?"),
    },
    q17: {
      topic: i18n._("Motivation"),
      description: i18n._("Is motivation more important than discipline?"),
    },
    q18: {
      topic: i18n._("Privacy"),
      description: i18n._("Is personal privacy still possible in the digital age?"),
    },
    q19: {
      topic: i18n._("Learning"),
      description: i18n._("Is self-learning more effective than traditional education?"),
    },
    q20: {
      topic: i18n._("Creativity"),
      description: i18n._("Can creativity be taught, or is it natural talent?"),
    },

    q21: {
      topic: i18n._("Career Choices"),
      description: i18n._("Is it better to choose a job you love or one that pays well?"),
    },
    q22: {
      topic: i18n._("Technology"),
      description: i18n._("Do smartphones improve or damage our attention span?"),
    },
    q23: {
      topic: i18n._("Workplace"),
      description: i18n._("Should managers be friends with their employees?"),
    },
    q24: {
      topic: i18n._("Innovation"),
      description: i18n._("Does innovation come more from freedom or pressure?"),
    },
    q25: {
      topic: i18n._("Personal Growth"),
      description: i18n._("Is comfort the enemy of growth?"),
    },

    q26: {
      topic: i18n._("AI vs Humans"),
      description: i18n._("Will AI ever truly understand human emotions?"),
    },
    q27: {
      topic: i18n._("Education"),
      description: i18n._("Should exams be replaced by continuous assessment?"),
    },
    q28: {
      topic: i18n._("Work"),
      description: i18n._("Is job security more important than job satisfaction?"),
    },
    q29: {
      topic: i18n._("Decision Making"),
      description: i18n._("Is it better to make fast decisions or well-analyzed ones?"),
    },
    q30: {
      topic: i18n._("Society"),
      description: i18n._("Does modern life make people more anxious than before?"),
    },

    q31: {
      topic: i18n._("AI Regulation"),
      description: i18n._("Should governments strictly regulate AI development?"),
    },
    q32: {
      topic: i18n._("Productivity"),
      description: i18n._("Are productivity tools actually making us more productive?"),
    },
    q33: {
      topic: i18n._("Career Growth"),
      description: i18n._("Is changing jobs frequently good or bad for a career?"),
    },
    q34: {
      topic: i18n._("Values"),
      description: i18n._("Should personal values ever be compromised for success?"),
    },
    q35: {
      topic: i18n._("Learning Habits"),
      description: i18n._("Is learning by doing more effective than learning by reading?"),
    },

    q36: {
      topic: i18n._("AI Companions"),
      description: i18n._("Can AI replace human companionship in the future?"),
    },
    q37: {
      topic: i18n._("Work Environment"),
      description: i18n._("Is a competitive workplace better than a collaborative one?"),
    },
    q38: {
      topic: i18n._("Time Management"),
      description: i18n._("Is multitasking a useful skill or a myth?"),
    },
    q39: {
      topic: i18n._("Creativity"),
      description: i18n._("Do limitations help or hurt creativity?"),
    },
    q40: {
      topic: i18n._("Personal Goals"),
      description: i18n._("Is having a clear life plan important?"),
    },

    q41: {
      topic: i18n._("AI Education"),
      description: i18n._("Should students be allowed to use AI tools in school?"),
    },
    q42: {
      topic: i18n._("Motivation"),
      description: i18n._("Is external pressure useful for motivation?"),
    },
    q43: {
      topic: i18n._("Workplace Feedback"),
      description: i18n._("Is direct feedback always better than polite feedback?"),
    },
    q44: {
      topic: i18n._("Technology"),
      description: i18n._("Does automation create more jobs than it destroys?"),
    },
    q45: {
      topic: i18n._("Personal Development"),
      description: i18n._("Is self-discipline more important than talent?"),
    },

    q46: {
      topic: i18n._("AI Trust"),
      description: i18n._("Would you trust AI more than humans in critical situations?"),
    },
    q47: {
      topic: i18n._("Career Advice"),
      description: i18n._("Is following advice from others helpful or limiting?"),
    },
    q48: {
      topic: i18n._("Education System"),
      description: i18n._("Is the current education system preparing people for real life?"),
    },
    q49: {
      topic: i18n._("Work Motivation"),
      description: i18n._("Is passion necessary to do great work?"),
    },
    q50: {
      topic: i18n._("Future"),
      description: i18n._("Are people optimistic or pessimistic about the future, and why?"),
    },

    q51: {
      topic: i18n._("AI Creativity"),
      description: i18n._("Can AI-generated content be considered original creativity?"),
    },
    q52: {
      topic: i18n._("Career Risk"),
      description: i18n._("Is taking career risks necessary for long-term success?"),
    },
    q53: {
      topic: i18n._("Learning Speed"),
      description: i18n._("Is learning fast better than learning deeply?"),
    },
    q54: {
      topic: i18n._("Technology Dependence"),
      description: i18n._("Have people become too dependent on technology?"),
    },
    q55: {
      topic: i18n._("Work Satisfaction"),
      description: i18n._("Should work be a major source of personal fulfillment?"),
    },

    q56: {
      topic: i18n._("AI and Responsibility"),
      description: i18n._("Who should be responsible when AI makes a serious mistake?"),
    },
    q57: {
      topic: i18n._("Decision Regret"),
      description: i18n._("Is it worse to make a wrong decision or make no decision at all?"),
    },
    q58: {
      topic: i18n._("Workplace Culture"),
      description: i18n._("Is company culture more important than salary?"),
    },
    q59: {
      topic: i18n._("Personal Freedom"),
      description: i18n._("Does financial independence equal personal freedom?"),
    },
    q60: {
      topic: i18n._("Learning Methods"),
      description: i18n._("Is learning from mistakes more effective than learning from success?"),
    },

    q61: {
      topic: i18n._("AI and Trust"),
      description: i18n._("Should people trust AI recommendations more than human advice?"),
    },
    q62: {
      topic: i18n._("Career Purpose"),
      description: i18n._("Is having a sense of purpose at work essential?"),
    },
    q63: {
      topic: i18n._("Digital Communication"),
      description: i18n._("Has digital communication improved or weakened human relationships?"),
    },
    q64: {
      topic: i18n._("Education Pressure"),
      description: i18n._("Do grades motivate students or limit their potential?"),
    },
    q65: {
      topic: i18n._("Success Mindset"),
      description: i18n._("Is confidence more important than competence?"),
    },

    q66: {
      topic: i18n._("AI and Employment"),
      description: i18n._("Should companies replace humans with AI if it is cheaper and faster?"),
    },
    q67: {
      topic: i18n._("Career Stability"),
      description: i18n._("Is stability overrated in modern careers?"),
    },
    q68: {
      topic: i18n._("Personal Growth"),
      description: i18n._("Does discomfort always lead to personal growth?"),
    },
    q69: {
      topic: i18n._("Time Value"),
      description: i18n._("Is time more valuable than money?"),
    },
    q70: {
      topic: i18n._("Creativity vs Efficiency"),
      description: i18n._("Should efficiency be prioritized over creativity at work?"),
    },

    q71: {
      topic: i18n._("AI Bias"),
      description: i18n._("Can AI ever be completely unbiased?"),
    },
    q72: {
      topic: i18n._("Career Advice"),
      description: i18n._("Is following your passion good career advice?"),
    },
    q73: {
      topic: i18n._("Social Comparison"),
      description: i18n._("Does comparing yourself to others help or harm motivation?"),
    },
    q74: {
      topic: i18n._("Learning Technology"),
      description: i18n._("Do online courses provide the same value as in-person learning?"),
    },
    q75: {
      topic: i18n._("Work Expectations"),
      description: i18n._("Do modern workers expect too much from their jobs?"),
    },

    q76: {
      topic: i18n._("AI and Creativity"),
      description: i18n._("Should AI be credited as a creator or just a tool?"),
    },
    q77: {
      topic: i18n._("Risk and Fear"),
      description: i18n._("Does fear protect us or limit us more?"),
    },
    q78: {
      topic: i18n._("Work Focus"),
      description: i18n._("Is deep focus more valuable than being constantly available?"),
    },
    q79: {
      topic: i18n._("Personal Responsibility"),
      description: i18n._("Are people responsible for their circumstances?"),
    },
    q80: {
      topic: i18n._("Innovation Speed"),
      description: i18n._("Is fast innovation more dangerous than slow progress?"),
    },

    q81: {
      topic: i18n._("AI Decision Making"),
      description: i18n._("Should AI be allowed to make life-changing decisions?"),
    },
    q82: {
      topic: i18n._("Career Identity"),
      description: i18n._("Should people define themselves by their profession?"),
    },
    q83: {
      topic: i18n._("Learning Motivation"),
      description: i18n._("Is curiosity more powerful than discipline for learning?"),
    },
    q84: {
      topic: i18n._("Digital Detox"),
      description: i18n._("Is regular digital detox necessary in modern life?"),
    },
    q85: {
      topic: i18n._("Work Performance"),
      description: i18n._("Does pressure improve or damage performance?"),
    },

    q86: {
      topic: i18n._("AI Companionship"),
      description: i18n._("Is forming emotional bonds with AI healthy or harmful?"),
    },
    q87: {
      topic: i18n._("Career Planning"),
      description: i18n._("Is long-term career planning realistic today?"),
    },
    q88: {
      topic: i18n._("Self-Improvement"),
      description: i18n._("Can constant self-improvement become harmful?"),
    },
    q89: {
      topic: i18n._("Freedom vs Security"),
      description: i18n._("Is freedom more important than security?"),
    },
    q90: {
      topic: i18n._("Creativity Pressure"),
      description: i18n._("Does pressure kill creativity or enhance it?"),
    },

    q91: {
      topic: i18n._("AI and Ethics"),
      description: i18n._("Should AI follow strict ethical rules even if it reduces efficiency?"),
    },
    q92: {
      topic: i18n._("Career Success"),
      description: i18n._("Is success mostly a result of effort or circumstances?"),
    },
    q93: {
      topic: i18n._("Learning Failure"),
      description: i18n._("Should failure be celebrated in learning environments?"),
    },
    q94: {
      topic: i18n._("Technology Pace"),
      description: i18n._("Is technology developing faster than society can adapt?"),
    },
    q95: {
      topic: i18n._("Work Meaning"),
      description: i18n._("Is meaningful work more important than high pay?"),
    },

    q96: {
      topic: i18n._("AI Autonomy"),
      description: i18n._("Should AI systems be allowed to operate without human oversight?"),
    },
    q97: {
      topic: i18n._("Career Satisfaction"),
      description: i18n._("Is career satisfaction a personal responsibility or a company’s role?"),
    },
    q98: {
      topic: i18n._("Modern Learning"),
      description: i18n._("Is information overload making learning harder?"),
    },
    q99: {
      topic: i18n._("Personal Values"),
      description: i18n._("Should personal values guide every major life decision?"),
    },
    q100: {
      topic: i18n._("Future of Work"),
      description: i18n._("Will traditional jobs still exist in 20 years?"),
    },
  };

  return { questions };
};
