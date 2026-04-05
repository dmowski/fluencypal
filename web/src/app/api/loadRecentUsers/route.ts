import { validateAuthToken } from '../config/firebase';
import { DEV_EMAILS } from '@/features/DevTools/dev';
import { getRecentCreatedUsers, getUsersQuizSurvey } from '../user/getUserInfo';
import { LoadRecentUsersResponse, RecentUserWithSurvey } from './types';

export async function POST(request: Request) {
  const userInfo = await validateAuthToken(request);
  if (!userInfo.uid) {
    throw new Error('User is not authenticated');
  }
  const isAdmin = DEV_EMAILS.includes(userInfo.email);
  if (!isAdmin) {
    throw new Error('User is not authorized');
  }

  const recentUsers = await getRecentCreatedUsers(20);

  const users: RecentUserWithSurvey[] = await Promise.all(
    recentUsers.map(async (user) => {
      const quizSurvey = await getUsersQuizSurvey(user.id);
      return {
        user: user,
        quizSurvey,
      };
    }),
  );

  const response: LoadRecentUsersResponse = { users };
  return Response.json(response);
}
