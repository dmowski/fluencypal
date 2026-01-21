import { useLingui } from '@lingui/react';
import { BattleQuestion } from './types';

export const useBattleQuestions = () => {
  const i18n = useLingui();

  const questions: Record<string, BattleQuestion> = {
    q1: {
      topic: 'Remote Work',
      description:
        'Is remote work better for productivity than working in an office? Why or why not?',
    },
    q2: {
      topic: 'Artificial Intelligence',
      description:
        'Should AI be allowed to replace humans in creative jobs like writing or design?',
    },
    q3: {
      topic: 'Education',
      description: 'Is a university degree still necessary for career success today?',
    },
    q4: {
      topic: 'Social Media',
      description: 'Does social media do more harm than good for society?',
    },
    q5: {
      topic: 'Work-Life Balance',
      description: 'Should companies be responsible for employees’ mental health?',
    },

    q6: {
      topic: 'Technology',
      description: 'Does technology make people more connected or more lonely?',
    },
    q7: {
      topic: 'Career',
      description: 'Is it better to specialize deeply in one skill or stay a generalist?',
    },
    q8: {
      topic: 'Money',
      description: 'Does money bring freedom, happiness, or neither?',
    },
    q9: {
      topic: 'Leadership',
      description: 'Are great leaders born or made?',
    },
    q10: {
      topic: 'Failure',
      description: 'Is failure a necessary part of success?',
    },

    q11: {
      topic: 'AI Ethics',
      description: 'Should AI systems be required to explain how they make decisions?',
    },
    q12: {
      topic: 'Education',
      description: 'Should schools focus more on practical skills than theory?',
    },
    q13: {
      topic: 'Work Culture',
      description: 'Is working long hours a sign of ambition or poor time management?',
    },
    q14: {
      topic: 'Success',
      description: 'How should success be measured: money, impact, or happiness?',
    },
    q15: {
      topic: 'Communication',
      description: 'Is honest communication always the best policy?',
    },

    q16: {
      topic: 'AI in Daily Life',
      description: 'Would you trust AI to make important life decisions for you?',
    },
    q17: {
      topic: 'Motivation',
      description: 'Is motivation more important than discipline?',
    },
    q18: {
      topic: 'Privacy',
      description: 'Is personal privacy still possible in the digital age?',
    },
    q19: {
      topic: 'Learning',
      description: 'Is self-learning more effective than traditional education?',
    },
    q20: {
      topic: 'Creativity',
      description: 'Can creativity be taught, or is it natural talent?',
    },

    q21: {
      topic: 'Career Choices',
      description: 'Is it better to choose a job you love or one that pays well?',
    },
    q22: {
      topic: 'Technology',
      description: 'Do smartphones improve or damage our attention span?',
    },
    q23: {
      topic: 'Workplace',
      description: 'Should managers be friends with their employees?',
    },
    q24: {
      topic: 'Innovation',
      description: 'Does innovation come more from freedom or pressure?',
    },
    q25: {
      topic: 'Personal Growth',
      description: 'Is comfort the enemy of growth?',
    },

    q26: {
      topic: 'AI vs Humans',
      description: 'Will AI ever truly understand human emotions?',
    },
    q27: {
      topic: 'Education',
      description: 'Should exams be replaced by continuous assessment?',
    },
    q28: {
      topic: 'Work',
      description: 'Is job security more important than job satisfaction?',
    },
    q29: {
      topic: 'Decision Making',
      description: 'Is it better to make fast decisions or well-analyzed ones?',
    },
    q30: {
      topic: 'Society',
      description: 'Does modern life make people more anxious than before?',
    },

    q31: {
      topic: 'AI Regulation',
      description: 'Should governments strictly regulate AI development?',
    },
    q32: {
      topic: 'Productivity',
      description: 'Are productivity tools actually making us more productive?',
    },
    q33: {
      topic: 'Career Growth',
      description: 'Is changing jobs frequently good or bad for a career?',
    },
    q34: {
      topic: 'Values',
      description: 'Should personal values ever be compromised for success?',
    },
    q35: {
      topic: 'Learning Habits',
      description: 'Is learning by doing more effective than learning by reading?',
    },

    q36: {
      topic: 'AI Companions',
      description: 'Can AI replace human companionship in the future?',
    },
    q37: {
      topic: 'Work Environment',
      description: 'Is a competitive workplace better than a collaborative one?',
    },
    q38: {
      topic: 'Time Management',
      description: 'Is multitasking a useful skill or a myth?',
    },
    q39: {
      topic: 'Creativity',
      description: 'Do limitations help or hurt creativity?',
    },
    q40: {
      topic: 'Personal Goals',
      description: 'Is having a clear life plan important?',
    },

    q41: {
      topic: 'AI Education',
      description: 'Should students be allowed to use AI tools in school?',
    },
    q42: {
      topic: 'Motivation',
      description: 'Is external pressure useful for motivation?',
    },
    q43: {
      topic: 'Workplace Feedback',
      description: 'Is direct feedback always better than polite feedback?',
    },
    q44: {
      topic: 'Technology',
      description: 'Does automation create more jobs than it destroys?',
    },
    q45: {
      topic: 'Personal Development',
      description: 'Is self-discipline more important than talent?',
    },

    q46: {
      topic: 'AI Trust',
      description: 'Would you trust AI more than humans in critical situations?',
    },
    q47: {
      topic: 'Career Advice',
      description: 'Is following advice from others helpful or limiting?',
    },
    q48: {
      topic: 'Education System',
      description: 'Is the current education system preparing people for real life?',
    },
    q49: {
      topic: 'Work Motivation',
      description: 'Is passion necessary to do great work?',
    },
    q50: {
      topic: 'Future',
      description: 'Are people optimistic or pessimistic about the future, and why?',
    },

    q51: {
      topic: 'AI Creativity',
      description: 'Can AI-generated content be considered original creativity?',
    },
    q52: {
      topic: 'Career Risk',
      description: 'Is taking career risks necessary for long-term success?',
    },
    q53: {
      topic: 'Learning Speed',
      description: 'Is learning fast better than learning deeply?',
    },
    q54: {
      topic: 'Technology Dependence',
      description: 'Have people become too dependent on technology?',
    },
    q55: {
      topic: 'Work Satisfaction',
      description: 'Should work be a major source of personal fulfillment?',
    },

    q56: {
      topic: 'AI and Responsibility',
      description: 'Who should be responsible when AI makes a serious mistake?',
    },
    q57: {
      topic: 'Decision Regret',
      description: 'Is it worse to make a wrong decision or make no decision at all?',
    },
    q58: {
      topic: 'Workplace Culture',
      description: 'Is company culture more important than salary?',
    },
    q59: {
      topic: 'Personal Freedom',
      description: 'Does financial independence equal personal freedom?',
    },
    q60: {
      topic: 'Learning Methods',
      description: 'Is learning from mistakes more effective than learning from success?',
    },

    q61: {
      topic: 'AI and Trust',
      description: 'Should people trust AI recommendations more than human advice?',
    },
    q62: {
      topic: 'Career Purpose',
      description: 'Is having a sense of purpose at work essential?',
    },
    q63: {
      topic: 'Digital Communication',
      description: 'Has digital communication improved or weakened human relationships?',
    },
    q64: {
      topic: 'Education Pressure',
      description: 'Do grades motivate students or limit their potential?',
    },
    q65: {
      topic: 'Success Mindset',
      description: 'Is confidence more important than competence?',
    },

    q66: {
      topic: 'AI and Employment',
      description: 'Should companies replace humans with AI if it is cheaper and faster?',
    },
    q67: {
      topic: 'Career Stability',
      description: 'Is stability overrated in modern careers?',
    },
    q68: {
      topic: 'Personal Growth',
      description: 'Does discomfort always lead to personal growth?',
    },
    q69: {
      topic: 'Time Value',
      description: 'Is time more valuable than money?',
    },
    q70: {
      topic: 'Creativity vs Efficiency',
      description: 'Should efficiency be prioritized over creativity at work?',
    },

    q71: {
      topic: 'AI Bias',
      description: 'Can AI ever be completely unbiased?',
    },
    q72: {
      topic: 'Career Advice',
      description: 'Is following your passion good career advice?',
    },
    q73: {
      topic: 'Social Comparison',
      description: 'Does comparing yourself to others help or harm motivation?',
    },
    q74: {
      topic: 'Learning Technology',
      description: 'Do online courses provide the same value as in-person learning?',
    },
    q75: {
      topic: 'Work Expectations',
      description: 'Do modern workers expect too much from their jobs?',
    },

    q76: {
      topic: 'AI and Creativity',
      description: 'Should AI be credited as a creator or just a tool?',
    },
    q77: {
      topic: 'Risk and Fear',
      description: 'Does fear protect us or limit us more?',
    },
    q78: {
      topic: 'Work Focus',
      description: 'Is deep focus more valuable than being constantly available?',
    },
    q79: {
      topic: 'Personal Responsibility',
      description: 'Are people responsible for their circumstances?',
    },
    q80: {
      topic: 'Innovation Speed',
      description: 'Is fast innovation more dangerous than slow progress?',
    },

    q81: {
      topic: 'AI Decision Making',
      description: 'Should AI be allowed to make life-changing decisions?',
    },
    q82: {
      topic: 'Career Identity',
      description: 'Should people define themselves by their profession?',
    },
    q83: {
      topic: 'Learning Motivation',
      description: 'Is curiosity more powerful than discipline for learning?',
    },
    q84: {
      topic: 'Digital Detox',
      description: 'Is regular digital detox necessary in modern life?',
    },
    q85: {
      topic: 'Work Performance',
      description: 'Does pressure improve or damage performance?',
    },

    q86: {
      topic: 'AI Companionship',
      description: 'Is forming emotional bonds with AI healthy or harmful?',
    },
    q87: {
      topic: 'Career Planning',
      description: 'Is long-term career planning realistic today?',
    },
    q88: {
      topic: 'Self-Improvement',
      description: 'Can constant self-improvement become harmful?',
    },
    q89: {
      topic: 'Freedom vs Security',
      description: 'Is freedom more important than security?',
    },
    q90: {
      topic: 'Creativity Pressure',
      description: 'Does pressure kill creativity or enhance it?',
    },

    q91: {
      topic: 'AI and Ethics',
      description: 'Should AI follow strict ethical rules even if it reduces efficiency?',
    },
    q92: {
      topic: 'Career Success',
      description: 'Is success mostly a result of effort or circumstances?',
    },
    q93: {
      topic: 'Learning Failure',
      description: 'Should failure be celebrated in learning environments?',
    },
    q94: {
      topic: 'Technology Pace',
      description: 'Is technology developing faster than society can adapt?',
    },
    q95: {
      topic: 'Work Meaning',
      description: 'Is meaningful work more important than high pay?',
    },

    q96: {
      topic: 'AI Autonomy',
      description: 'Should AI systems be allowed to operate without human oversight?',
    },
    q97: {
      topic: 'Career Satisfaction',
      description: 'Is career satisfaction a personal responsibility or a company’s role?',
    },
    q98: {
      topic: 'Modern Learning',
      description: 'Is information overload making learning harder?',
    },
    q99: {
      topic: 'Personal Values',
      description: 'Should personal values guide every major life decision?',
    },
    q100: {
      topic: 'Future of Work',
      description: 'Will traditional jobs still exist in 20 years?',
    },
  };

  return { questions };
};
