import { createContext, JSX, ReactNode, useContext } from 'react';
import { useLingui } from '@lingui/react';
import { CommunitySpace } from './types';

interface CommunitySpaceContext {
  spaces: CommunitySpace[];
}

const CommunitySpaceContext = createContext<CommunitySpaceContext | null>(null);

const useProvideCommunitySpace = (): CommunitySpaceContext => {
  const { i18n } = useLingui();
  const spaces: CommunitySpace[] = [
    {
      id: 'development',
      title: i18n._('Announcements'),
      description: i18n._('Stay updated with the latest announcements and news'),
    },

    {
      id: 'poland',
      title: i18n._('Poland'),
      description: i18n._('Discuss topics related to Poland and its community'),
    },

    {
      id: 'software-development',
      title: i18n._('Software Development'),
      description: i18n._('Share insights, ask questions, and discuss software development topics'),
    },

    {
      id: 'ai-in-education',
      title: i18n._('AI in education'),
      description: i18n._('Explore the impact of AI on education and share resources'),
    },

    {
      id: 'essay-writing',
      title: i18n._('Essay Writing'),
      description: i18n._('Share tips, ask questions, and discuss essay writing techniques'),
    },

    // Exams
    {
      id: 'exams',
      title: i18n._('Exams'),
      description: i18n._(
        'Discuss exam preparation strategies, share resources, and support each other',
      ),
    },

    // Tests
    {
      id: 'tests',
      title: i18n._('Tests'),
      description: i18n._('Share test-taking strategies, resources, and support each other'),
    },

    // Job interviews
    {
      id: 'job-interviews',
      title: i18n._('Job Interviews'),
      description: i18n._(
        'Discuss job interview preparation, share resources, and support each other',
      ),
    },

    // travel
    {
      id: 'travel',
      title: i18n._('Travel'),
      description: i18n._('Share travel tips, ask questions, and discuss travel experiences'),
    },

    // relocation
    {
      id: 'relocation',
      title: i18n._('Relocation'),
      description: i18n._(
        'Discuss relocation experiences, share tips, and support each other through the process',
      ),
    },
  ];

  return {
    spaces,
  };
};

export function CommunitySpaceProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideCommunitySpace();

  return <CommunitySpaceContext.Provider value={hook}>{children}</CommunitySpaceContext.Provider>;
}

export const useCommunitySpace = (): CommunitySpaceContext => {
  const context = useContext(CommunitySpaceContext);
  if (!context) {
    throw new Error('useCommunitySpace must be used within a CommunitySpaceProvider');
  }

  return context;
};
