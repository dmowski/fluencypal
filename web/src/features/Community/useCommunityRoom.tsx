import { useLingui } from '@lingui/react';
import { Room } from './types';

export const useCommunityRoom = () => {
  const { i18n } = useLingui();
  const rooms: Room[] = [
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
  ];

  return {
    rooms,
  };
};
