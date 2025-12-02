import { I18n } from "@lingui/core";
import { Idea } from "./IdeasLandings";

export function getIdeaMetaInfo(idea: Idea, i18n: I18n) {
  const metaMap: Record<
    Idea,
    {
      title: string;
      description: string;
      keywords: string[];
    }
  > = {
    "interview-speed": {
      title: i18n._(`Prepare for the Job Interview`),
      description: i18n._(
        `Get ready for your next interview with our comprehensive guide covering common questions, tips, and strategies to help you succeed.`
      ),
      keywords: [
        i18n._(`interview preparation`),
        i18n._(`common interview questions`),
        i18n._(`interview tips`),
        i18n._(`job interview strategies`),
      ],
    },
    "interview-frontend": {
      title: i18n._(`Frontend Interview Preparation`),
      description: i18n._(
        `Master frontend interviews with our in-depth guide featuring essential topics, coding challenges, and best practices to land your dream job.`
      ),
      keywords: [
        i18n._(`frontend interview preparation`),
        i18n._(`frontend interview questions`),
        i18n._(`JavaScript interview tips`),
        i18n._(`CSS interview strategies`),
      ],
    },
    "interview-backend": {
      title: i18n._(`Backend Interview Preparation`),
      description: i18n._(
        `Ace your backend interviews with our expert guide covering key concepts, algorithms, and system design principles to help you succeed.`
      ),
      keywords: [
        i18n._(`backend interview preparation`),
        i18n._(`backend interview questions`),
        i18n._(`database interview tips`),
        i18n._(`API design interview strategies`),
      ],
    },
  };

  return metaMap[idea];
}
