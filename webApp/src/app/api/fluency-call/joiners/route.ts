import { jsonIfAuthTokenError } from '@/app/api/config/authTokenError';
import { getAuthUser, getDB, validateAuthToken } from '@/app/api/config/firebase';
import { DEV_EMAILS } from '@/features/DevTools/dev';

const MAX_USER_IDS = 200;

export async function POST(request: Request) {
  let userInfo: Awaited<ReturnType<typeof validateAuthToken>>;
  try {
    userInfo = await validateAuthToken(request);
  } catch (error) {
    const unauthorized = jsonIfAuthTokenError(error);
    if (unauthorized) return unauthorized;
    throw error;
  }

  if (!DEV_EMAILS.includes(userInfo.email)) {
    return Response.json({ error: 'User is not authorized' }, { status: 403 });
  }

  const body = (await request.json()) as { userIds?: unknown };
  if (!Array.isArray(body.userIds)) {
    return Response.json({ error: 'userIds is required' }, { status: 400 });
  }

  const userIds = [
    ...new Set(
      body.userIds.filter(
        (id): id is string => typeof id === 'string' && id.length > 0 && id.length <= 128,
      ),
    ),
  ].slice(0, MAX_USER_IDS);

  const db = getDB();
  const users = await Promise.all(
    userIds.map(async (userId) => {
      const authUser = await getAuthUser(userId);
      if (authUser?.email) {
        return { userId, email: authUser.email };
      }

      const snap = await db.collection('users').doc(userId).get();
      const stored = snap.data()?.email;
      return { userId, email: typeof stored === 'string' ? stored : '' };
    }),
  );

  return Response.json({ users });
}
