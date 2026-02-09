import { Stack, Link, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { UserStat } from '@/app/api/loadStats/types';
import dayjs from 'dayjs';
import { getFirebaseLink } from '../../Firebase/getFirebaseLink';
import { useGame } from '../../Game/useGame';
import { fullEnglishLanguageName, SupportedLanguage } from '../../Lang/lang';
import { LogIn, UserPlus, BadgeCheck, Gem } from 'lucide-react';
import { defaultAvatar } from '../../Game/avatars';
import { UserSource } from '@/common/analytics';
import { Messages } from '../../Conversation/Messages';
import { Conversation } from '@/common/conversation';
import { CustomModal } from '../../uiKit/Modal/CustomModal';
import { GoalPlan } from '../../Plan/types';
import { GoalReview } from '../../Goal/Quiz/GoalReview';
import { Avatar } from '../../Game/Avatar';
import { parseBrowserInfo } from './parseBrowserInfo';
import { UserBadges } from './UserBadges';
import { UserStats } from './UserStats';
import { ConversationItem } from './ConversationItem';
import { GoalQuizSection } from './GoalQuizSection';

interface UserCardProps {
  userStat: UserStat;
  allTextInfo: string;
}

export function UserCard({ userStat, allTextInfo }: UserCardProps) {
  const game = useGame();
  const user = userStat.userData;
  const userId = user.id;
  const lastLoginAgo = user.lastLoginAtDateTime
    ? dayjs(user.lastLoginAtDateTime).fromNow()
    : 'Never';

  const createdAgo = user.createdAtIso ? dayjs(user.createdAtIso).fromNow() : 'Unknown';

  const isToday =
    user.lastLoginAtDateTime && dayjs().diff(dayjs(user.lastLoginAtDateTime), 'hour') < 24;

  const firebaseLink = getFirebaseLink(user.id);
  const countryName = user.countryName || '';
  const currency = user.currency || '';
  const photoUrl = user.photoUrl || '';
  const displayName = user.displayName || '';
  const countryImage = user.country
    ? `https://flagsapi.com/${user.country.toUpperCase()}/flat/64.png`
    : '';

  const totalMessages = userStat.conversationMeta.totalMessages || 0;
  const conversationCount = userStat.conversationMeta.conversationCount || 0;
  const lastConversationDateTime = userStat.conversationMeta.lastConversationDate;
  const lastConversationAgo = lastConversationDateTime
    ? dayjs(lastConversationDateTime).fromNow()
    : 'Never';

  const pageLanguageCode = user.pageLanguageCode || 'en';

  const userSource: UserSource | null = userStat.userData.userSource || null;
  const isFromChatGpt =
    userSource?.referrer?.toLowerCase().includes('chatgpt') ||
    userSource?.utmSource?.toLowerCase().includes('chatgpt');

  const interviewStats = userStat.interviewStats || [];
  const gameUsername = game.userNames?.[userId || ''] || '';
  const userStats = game.stats.find((s) => s.userId === userId);
  const gameAvatar = game.gameAvatars[userId || ''] || defaultAvatar;
  const nativeLanguage =
    fullEnglishLanguageName[user.nativeLanguageCode as SupportedLanguage] ||
    user.nativeLanguageCode ||
    'en';
  const languageToLearn = fullEnglishLanguageName[user.languageCode || 'en'];

  const lastHourMessages = userStat.conversationMeta.lastHourMessages || 0;

  const learning = `${nativeLanguage} → ${languageToLearn}`;
  const todaysConversationsMessages = userStat.conversationMeta.todayMessages || 0;

  const isGameWinner = userStat.isGameWinner;
  const activeSubscriptionTill = userStat.activeSubscriptionTill;
  const isActiveSubscriber = !!(
    activeSubscriptionTill && dayjs(activeSubscriptionTill).isAfter(dayjs())
  );

  const conversations = userStat.conversationMeta.conversations || [];

  const aiUserInfo = userStat.aiUserInfo;
  const browserInfo = userStat.userData?.browserInfo || '';
  const parsedBrowserInfo = browserInfo ? parseBrowserInfo(browserInfo) : null;

  const [showConversation, setShowConversation] = useState<Conversation | null>(null);
  const [showGoalPlan, setShowGoalPlan] = useState<GoalPlan | null>(null);

  return (
    <Stack
      sx={{
        border: isToday ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
        borderRadius: '10px',
        padding: '14px 25px',
        flexDirection: 'row',
        gap: '25px',
        backgroundColor: 'rgba(17, 17, 17, 0.2)',
        height: '500px',
      }}
    >
      {showGoalPlan && (
        <CustomModal onClose={() => setShowGoalPlan(null)} isOpen={true}>
          <GoalReview
            goalData={showGoalPlan}
            onClick={function (): void {
              setShowGoalPlan(null);
            }}
            isLoading={false}
          />
        </CustomModal>
      )}

      {showConversation && (
        <CustomModal onClose={() => setShowConversation(null)} isOpen={true}>
          <Messages
            messageOrder={showConversation.messageOrder}
            conversation={showConversation.messages}
            voice="ash"
          />
        </CustomModal>
      )}

      <Stack
        sx={{
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <Avatar url={photoUrl || '/logo192.png'} avatarSize="50px" />

        <UserBadges
          isFromChatGpt={isFromChatGpt}
          isGameWinner={isGameWinner}
          isActiveSubscriber={isActiveSubscriber}
          activeSubscriptionTill={activeSubscriptionTill}
        />
      </Stack>

      <Stack
        sx={{
          width: '600px',
          gap: '10px',
          '.icon': {
            width: '16px',
            height: '16px',
            verticalAlign: 'middle',
            marginLeft: '4px',
          },
        }}
      >
        <Stack sx={{}}>
          <Link href={firebaseLink} variant="h6" target="_blank" rel="noopener noreferrer">
            {user.email} | {displayName}
          </Link>
          <Stack>
            <Tooltip title={dayjs(user.lastLoginAtDateTime).format('DD MMMM YYYY HH:mm') || ''}>
              <Typography variant="body2">
                <LogIn className="icon" /> {lastLoginAgo} | Login
              </Typography>
            </Tooltip>

            <Tooltip title={dayjs(user.createdAtIso).format('DD MMMM YYYY HH:mm') || ''}>
              <Typography variant="body2">
                <UserPlus className="icon" /> {createdAgo} | Created
              </Typography>
            </Tooltip>
          </Stack>
        </Stack>

        <UserStats
          lastHourMessages={lastHourMessages}
          todaysConversationsMessages={todaysConversationsMessages}
          totalMessages={totalMessages}
          conversationCount={conversationCount}
          lastConversationAgo={lastConversationAgo}
        />

        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 0',
          }}
        >
          {countryImage && (
            <img
              src={countryImage}
              alt={countryName}
              style={{
                borderRadius: '4px',
                width: '24px',
              }}
            />
          )}
          <Typography variant="caption">
            {['P:' + pageLanguageCode, countryName, currency, learning].filter(Boolean).join(' | ')}
          </Typography>
        </Stack>

        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 0',
            color: '#fff',
            textDecoration: 'none',
          }}
          component={'a'}
          target="_blank"
          href={`/practice?page=community&space=rate&userId=${userId}`}
        >
          {gameAvatar && (
            <img src={gameAvatar} style={{ borderRadius: '34px', width: '22px', height: '22px' }} />
          )}
          <Typography variant="caption">
            {[gameUsername, userStats?.points].filter(Boolean).join(' | ')}
          </Typography>
        </Stack>

        {userStat.userData.isCreditCardConfirmed && (
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 0',
              color: '#4caf50',
            }}
          >
            <Typography variant="caption">Card verified</Typography>
            <BadgeCheck size={'16px'} />
          </Stack>
        )}

        {interviewStats.length > 0 && (
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 0',
              color: '#ff27edff',
            }}
          >
            <Typography variant="body2">Interview app</Typography>
            <Gem size={'16px'} />
          </Stack>
        )}

        {userSource?.urlPath && (
          <Stack
            sx={{
              width: '100%',
              wordBreak: 'break-all',
            }}
          >
            <Typography variant="caption">{userSource?.urlPath || ''}</Typography>
          </Stack>
        )}

        {browserInfo && (
          <Stack
            sx={{
              width: '100%',
              wordBreak: 'break-all',
            }}
          >
            {parsedBrowserInfo ? (
              <Typography variant="caption">
                {parsedBrowserInfo.browserName} on {parsedBrowserInfo.os}
              </Typography>
            ) : (
              <Typography variant="caption">{browserInfo}</Typography>
            )}
          </Stack>
        )}
      </Stack>

      <Stack
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          gap: '10px',
        }}
      >
        {conversations.length === 0 && (
          <Typography
            sx={{
              opacity: 0.6,
            }}
          >
            No conversations
          </Typography>
        )}
        {conversations
          .sort((a, b) => {
            return (b.updatedAtIso || '').localeCompare(a.updatedAtIso || '');
          })
          .filter((_, index) => index < 23)
          .map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              onClick={() => setShowConversation(conversation)}
            />
          ))}

        <GoalQuizSection
          goalQuiz2={userStat.goalQuiz2}
          aiUserInfo={aiUserInfo}
          onGoalClick={setShowGoalPlan}
        />
      </Stack>
    </Stack>
  );
}
