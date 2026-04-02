/**
 *  - Check if assessment is done
 *  - Generate assessment if not
 *  - Save assessment
 *  - Process all my conversations
 *  - Run assessment on users that logged in today
 */

import { getUserConversationsMeta } from '@/app/api/user/getUserInfo';

export const processAssessment = async () => {
  const userIdsToProcess = ['Mq2HfU3KrXTjNyOpPXqHSPg5izV2'];

  for (const userId of userIdsToProcess) {
    const conversationsMeta = await getUserConversationsMeta(userId);
    console.log('conversationsMeta', conversationsMeta.conversations);
  }
};
