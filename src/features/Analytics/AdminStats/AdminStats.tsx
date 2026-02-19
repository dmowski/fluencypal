'use client';
import { Button, Stack, Typography } from '@mui/material';
import { useAuth } from '../../Auth/useAuth';
import { DEV_EMAILS } from '@/common/dev';
import { useEffect, useMemo, useRef, useState } from 'react';
import { loadStatsRequest } from '@/app/api/loadStats/loadStatsRequest';
import { AdminStatsResponse } from '@/app/api/loadStats/types';
import dayjs from 'dayjs';
import { Check, Copy, House } from 'lucide-react';
import { UserCard } from './UserCard';
import { AdminMetrics } from './AdminMetrics';
import { copyToClipboard } from './copyToClipboard';
import { StoryCreator } from './StoryCreator';

export function AdminStats() {
  const auth = useAuth();
  const isAdmin = DEV_EMAILS.includes(auth?.userInfo?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const [sourceData, setData] = useState<AdminStatsResponse | null>(null);

  const [usersToShowMode, setUsersToShowMode] = useState<'all' | 'today' | 'secondDay' | 'old'>(
    'all',
  );

  const data = useMemo(() => {
    if (!sourceData) return null;
    const cleanUsers = sourceData?.users.filter((user) => {
      const isDev = user.userData.email?.includes('dmowski');
      const isHasConversations = (user.conversationMeta.conversationCount || 0) > 0;
      return !isDev && isHasConversations;
    });
    return { ...sourceData, users: cleanUsers || [] };
  }, [sourceData]);

  const loadFullData = async () => {
    isLoadingRef.current = true;
    setIsLoading(true);
    const result = await loadStatsRequest({ isFullExport: true }, await auth.getToken());
    isLoadingRef.current = false;
    setIsLoading(false);
    setData(result);
  };

  const loadStatsData = async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    const result = await loadStatsRequest({ isFullExport: false }, await auth.getToken());
    isLoadingRef.current = false;
    setIsLoading(false);
    setData(result);
  };

  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    if (!isCopied) {
      return;
    }
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }, [isCopied]);

  const copyAll = async () => {
    const dataWithoutUserNames = data?.users
      .map((userStat) => {
        const { userData, ...rest } = userStat;
        const userDataUpdated = {
          country: userData.country,
          currency: userData.currency,
          countryName: userData.countryName,
          languageCode: userData.languageCode,
          nativeLanguageCode: userData.nativeLanguageCode,
          pageLanguageCode: userData.languageCode,
        };

        return {
          ...rest,
          userData: userDataUpdated,
          goalQuiz2: userStat.goalQuiz2.map((quiz) => {
            const updatedQuiz = {
              aboutUserTranscription: quiz.aboutUserTranscription,
              aboutUserFollowUpTranscription: quiz.aboutUserFollowUpTranscription,
              goalUserTranscription: quiz.goalUserTranscription,
            };

            return {
              ...updatedQuiz,
              goalData: undefined,
            };
          }),
        };
      })
      .filter((data) => data.goalQuiz2[0]?.aboutUserFollowUpTranscription);

    const allUsersString = JSON.stringify(dataWithoutUserNames, null, 2);
    await copyToClipboard(allUsersString);
    setIsCopied(true);
  };

  useEffect(() => {
    if (!isAdmin || isLoading || isLoadingRef.current || data) return;
    loadStatsData();
  }, [isLoading, isAdmin]);

  const users =
    data?.users.sort((a, b) => {
      const aLostLogins = a.userData.lastLoginAtDateTime || '';
      const bLostLogins = b.userData.lastLoginAtDateTime || '';
      if (!aLostLogins && !bLostLogins) return 0;
      if (!aLostLogins) return 1;
      if (!bLostLogins) return -1;
      return dayjs(bLostLogins).diff(dayjs(aLostLogins));
    }) || [];

  const todayUsers = users.filter((user) => {
    const lastLogin = user.userData.lastLoginAtDateTime;
    return lastLogin && dayjs().diff(dayjs(lastLogin), 'hour') < 24;
  });

  const secondDayVisitors = todayUsers.filter((user) => {
    const createdAt = user.userData.createdAtIso;
    const lastLogin = user.userData.lastLoginAtDateTime;

    return (
      createdAt &&
      lastLogin &&
      dayjs(lastLogin).diff(dayjs(createdAt), 'hour') >= 24 &&
      dayjs(lastLogin).diff(dayjs(createdAt), 'hour') < 48
    );
  });

  const thirdAndMoreDayVisitors = todayUsers.filter((user) => {
    const createdAt = user.userData.createdAtIso;
    const lastLogin = user.userData.lastLoginAtDateTime;
    return createdAt && lastLogin && dayjs(lastLogin).diff(dayjs(createdAt), 'hour') >= 48;
  });

  const todayMessagesCount = todayUsers.reduce((acc, user) => {
    const todayMessages = user.conversationMeta.todayMessages || 0;
    return acc + todayMessages;
  }, 0);

  const lastHourMessagesCount = todayUsers.reduce((acc, user) => {
    const lastHourMessages = user.conversationMeta.lastHourMessages || 0;
    return acc + lastHourMessages;
  }, 0);

  const usersToShow =
    usersToShowMode === 'all'
      ? users
      : usersToShowMode === 'today'
        ? todayUsers
        : usersToShowMode === 'secondDay'
          ? secondDayVisitors
          : thirdAndMoreDayVisitors;

  const [isStoryCreator, setIsStoryCreator] = useState(false);

  if (!isAdmin) return <></>;
  return (
    <Stack sx={{}}>
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <Button
          href="/practice"
          sx={{
            width: 'max-content',
            padding: '10px 50px',
            margin: '20px 0',
            borderRadius: '210px',
          }}
          variant="contained"
          startIcon={<House />}
        >
          Home
        </Button>

        <Button
          onClick={() => setIsStoryCreator((prev) => !prev)}
          sx={{
            width: 'max-content',
            padding: '10px 50px',
            margin: '20px 0',
            borderRadius: '210px',
          }}
          variant={isStoryCreator ? 'contained' : 'outlined'}
        >
          Open Story Creator
        </Button>
      </Stack>

      {isStoryCreator ? (
        <StoryCreator />
      ) : (
        <>
          {isLoading && <Typography>Loading...</Typography>}
          {data && (
            <>
              <Stack
                sx={{
                  alignItems: 'flex-start',
                }}
              >
                <AdminMetrics
                  todayMessagesCount={todayMessagesCount}
                  lastHourMessagesCount={lastHourMessagesCount}
                  todayUsersCount={todayUsers.length}
                  secondDayVisitorsCount={secondDayVisitors.length}
                  thirdAndMoreDayVisitorsCount={thirdAndMoreDayVisitors.length}
                  usersToShowMode={usersToShowMode}
                  onModeChange={setUsersToShowMode}
                />

                <Stack
                  sx={{
                    gap: '10px',
                    flexDirection: 'row',
                  }}
                >
                  <Button variant="contained" onClick={loadFullData}>
                    Load full data
                  </Button>
                  <Button
                    color={isCopied ? 'success' : 'primary'}
                    startIcon={isCopied ? <Check size="16px" /> : <Copy size="16px" />}
                    variant="outlined"
                    size="small"
                    onClick={() => copyAll()}
                  >
                    Copy to clipboard
                  </Button>
                </Stack>
              </Stack>
              <Stack
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '36px',
                  padding: '20px 10px',
                }}
              >
                {usersToShow.map((user) => (
                  <UserCard
                    key={user.userData.id}
                    userStat={user}
                    allTextInfo={JSON.stringify(user, null, 2)}
                  />
                ))}
              </Stack>
            </>
          )}
        </>
      )}
    </Stack>
  );
}
