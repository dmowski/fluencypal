import { validateAuthToken, listRecentAuthUsers } from '../config/firebase';
import { DEV_EMAILS } from '@/features/DevTools/dev';
import { getUsersQuizSurvey } from '../user/getUserInfo';
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

  const recentAuthUsers = await listRecentAuthUsers(20);

  const users: RecentUserWithSurvey[] = await Promise.all(
    recentAuthUsers.map(async (authUser) => {
      const quizSurvey = await getUsersQuizSurvey(authUser.uid);
      return { user: authUser, quizSurvey };
    }),
  );

  const response: LoadRecentUsersResponse = { users };
  return Response.json(response);
}
