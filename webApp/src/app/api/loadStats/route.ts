import { validateAuthToken } from '../config/firebase';
import { DEV_EMAILS } from '@/features/DevTools/dev';
import { AdminStatsRequest, AdminStatsResponse, UserStat } from './types';
import {
  getAllUsersWithIds,
  getUserAiInfo,
  getUserConversationsMeta,
  getUserDailyTasksProgress,
  getUserGoals,
  getUserInteractiveLessonStores,
  getUsersInterviewSurvey,
  getUsersQuizSurvey,
} from '../user/getUserInfo';
import { countLessonsCompletedSince } from '@/features/InteractiveLesson/countLessonsCompletedSince';
import { getUserBalance } from '../payment/getUserBalance';
import { getAllProgressStatsForUser } from '@/features/ProgressStat/backend/processAssessment';
import { getAllNewsStats } from '@/features/News/backend/getAllNewsStats';
import { countNewsReadsLast24h } from '@/features/News/countNewsReadsLast24h';
import { getAllQuizStats } from '@/features/Quiz/backend/getAllQuizStats';
import { countQuizCompletionsLast24h } from '@/features/Quiz/countQuizCompletionsLast24h';

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  const reqBody = (await request.json()) as AdminStatsRequest;
  const isFullExport = reqBody.isFullExport;
  if (!userInfo.uid) {
    throw new Error('User is not authenticated');
  }
  const isAdmin = DEV_EMAILS.includes(userInfo.email);
  if (!isAdmin) {
    throw new Error('User is not authorized');
  }

  const allUsers = await getAllUsersWithIds({
    limits: isFullExport ? 1_000_000 : 100,
  });

  const [userStats, newsStats, quizStats] = await Promise.all([
    Promise.all(
      allUsers.map(async (user) => {
        const [
          conversationMeta,
          goalQuiz2,
          interviewStats,
          balance,
          aiUserInfo,
          dailyProgress,
          progressStats,
          goals,
          lessonStores,
        ] = await Promise.all([
          getUserConversationsMeta(user.id),
          getUsersQuizSurvey(user.id),
          getUsersInterviewSurvey(user.id),
          getUserBalance(user.id),
          getUserAiInfo(user.id),
          getUserDailyTasksProgress(user.id),
          getAllProgressStatsForUser(user.id),
          getUserGoals(user.id),
          getUserInteractiveLessonStores(user.id),
        ]);

        const userStat: UserStat = {
          userData: user,
          conversationMeta,
          goalQuiz2,
          interviewStats,
          activeSubscriptionTill: balance.activeSubscriptionTill,
          isGameWinner: balance.isGameWinner,
          aiUserInfo,
          dailyProgress,
          progressStats,
          goals,
          lessonsLast24h: countLessonsCompletedSince(lessonStores),
        };
        return userStat;
      }),
    ),
    getAllNewsStats(),
    getAllQuizStats(),
  ]);

  const response: AdminStatsResponse = {
    users: userStats,
    newsReadsLast24h: countNewsReadsLast24h(newsStats),
    quizCompletionsLast24h: countQuizCompletionsLast24h(quizStats),
  };
  return Response.json(response);
}
