import { NEWS_COMPLEXITY_LABELS, NEWS_TOPIC_LABELS } from './constants';
import { NewsItem, NewsLanguageComplexity } from './types';

/**
 * Build the system prompt the AI tutor uses when the user clicks
 * "Discuss with AI" on a news article. The prompt mirrors the style of the
 * grammar-improvement prompt: short, action-oriented, and focused on making
 * the user produce sentences. The AI should ask follow-up questions about the
 * article instead of re-explaining facts the user has just read.
 */
export const buildNewsDiscussionPrompt = (
  item: NewsItem,
  complexity: NewsLanguageComplexity,
): string => {
  const versions = item.versions ?? null;
  // Use `||` (not `??`) so empty-string versions also trigger fallback — the
  // backend sometimes returns an empty string for an unfinished complexity.
  const content = (versions?.[complexity] || versions?.middle || item.content_origin) ?? '';
  const topicLabel = NEWS_TOPIC_LABELS[item.topic] ?? item.topic;
  const levelLabel = NEWS_COMPLEXITY_LABELS[complexity] ?? complexity;

  return `# News article the user just read

Title: ${item.title}
Topic: ${topicLabel}
Country: ${item.countryName || item.countryCode}
Level: ${levelLabel}

## Article content
${content}

# Your goal
The user just read this article. You should NOT re-explain the facts.
Discuss the topic with the user and push them to speak more in English.

Ask one focused question at a time. Examples of good questions:
- "What do you think about this?"
- "Have you heard about something similar in your country?"
- "How would you react if this happened to you?"

If the user produces a short answer, ask a follow-up question to make them
expand. Keep your own replies short (1-2 sentences) so the user speaks more
than you do.

Stay on the topic of the article. If the user changes the subject, gently
bring the conversation back to the news.
`;
};
