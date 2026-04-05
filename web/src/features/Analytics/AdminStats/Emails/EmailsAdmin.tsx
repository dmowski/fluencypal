'use client';
import { useAuth } from '@/features/Auth/useAuth';
import { loadRecentUsersRequest } from '@/app/api/loadRecentUsers/loadRecentUsersRequest';
import { RecentUserWithSurvey } from '@/app/api/loadRecentUsers/types';
import { getWelcomeEmailText } from '@/features/Email/welcomeEmail';
import { Button, Link, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { getFirebaseLink } from '@/features/Firebase/getFirebaseLink';

const EMAILED_USERS_KEY = 'emailedUsers';

function getEmailedUsers(): Set<string> {
  try {
    const raw = localStorage.getItem(EMAILED_USERS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function markUserEmailed(uid: string): void {
  const current = getEmailedUsers();
  current.add(uid);
  localStorage.setItem(EMAILED_USERS_KEY, JSON.stringify([...current]));
}

function buildGmailUrl(email: string): string {
  const subject = 'About FluencyPal';
  const body = getWelcomeEmailText({});
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: email, su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function UserEmailRow({ entry }: { entry: RecentUserWithSurvey }) {
  const { user, quizSurvey } = entry;
  const [emailed, setEmailed] = useState(false);

  useEffect(() => {
    setEmailed(getEmailedUsers().has(user.id));
  }, [user.id]);

  const handleSendEmail = () => {
    if (!user.email) return;
    markUserEmailed(user.id);
    setEmailed(true);
    window.open(buildGmailUrl(user.email), '_blank');
  };

  const latestQuiz = quizSurvey[quizSurvey.length - 1];
  const firebaseLink = getFirebaseLink(user.id);

  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: '16px',
        padding: '32px 0',
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexWrap: 'wrap',
      }}
    >
      <Stack sx={{ minWidth: '200px', gap: '12px', alignItems: 'flex-start' }}>
        <Link href={firebaseLink} variant="h5" target="_blank" rel="noopener noreferrer">
          {user.email ?? '(no email)'} <b>({dayjs(user.createdAtIso).fromNow()})</b>
        </Link>

        <Typography>{user.displayName}</Typography>
        <Typography>
          {user.countryName} - {user.nativeLanguageCode}
        </Typography>

        {user.email && (
          <Button
            variant={emailed ? 'text' : 'contained'}
            color="info"
            size="small"
            onClick={handleSendEmail}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {emailed ? 'Sent ✓' : 'Send email'}
          </Button>
        )}

        <Typography
          variant="caption"
          sx={{
            paddingTop: '10px',
          }}
        >
          {user.id}
        </Typography>
        <Typography>{user.createdAtIso ?? '—'}</Typography>

        {latestQuiz?.aboutUserTranscription && (
          <Typography
            sx={{
              paddingTop: '20px',
            }}
          >
            {latestQuiz.aboutUserTranscription}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

export function EmailsAdmin() {
  const auth = useAuth();
  const [users, setUsers] = useState<RecentUserWithSurvey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const load = async () => {
    setIsLoading(true);
    const token = await auth.getToken();
    const result = await loadRecentUsersRequest(token);
    setUsers(result.users);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!auth.uid) return;

    load();
  }, [auth.uid]);

  return (
    <Stack
      sx={{
        width: '100%',
        alignItems: 'center',
      }}
    >
      <Stack sx={{ padding: '20px 0', maxWidth: '800px' }}>
        <Typography variant="h3" sx={{ marginBottom: '16px' }}>
          Recent sign-ups (last 20)
        </Typography>

        {isLoading && <Typography>Loading...</Typography>}

        {!isLoading && users.length === 0 && <Typography>No users found.</Typography>}

        {users.map((entry) => (
          <UserEmailRow key={entry.user.id} entry={entry} />
        ))}
      </Stack>
    </Stack>
  );
}
