import { Stack } from '@mui/material';
import { StatCard } from './StatCard';

interface UserStatsProps {
  lastHourMessages: number;
  todaysConversationsMessages: number;
  totalMessages: number;
  conversationCount: number;
  lastConversationAgo: string;
}

export function UserStats({
  lastHourMessages,
  todaysConversationsMessages,
  totalMessages,
  conversationCount,
  lastConversationAgo,
}: UserStatsProps) {
  return (
    <Stack
      sx={{
        padding: '20px 0',
        gap: '12px',
        b: {
          paddingRight: '12px',
          width: '40px',
          display: 'inline-block',
          textAlign: 'right',
        },
        '.stat-card': {
          border: '1px solid rgba(255, 255, 255, 0.1)',
          alignItems: 'center',
          gap: '0px',
          width: '140px',
          padding: '17px 12px 8px 12px',
          borderRadius: '8px',
          height: '120px',
          '.value': {
            fontSize: '30px',
            fontWeight: 600,
          },
          '.label': {
            opacity: 0.9,
          },
        },
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <StatCard value={lastHourMessages} label="Last Hour" isHighlighted={lastHourMessages > 0} />
      <StatCard
        value={todaysConversationsMessages}
        label="Today"
        isHighlighted={todaysConversationsMessages > 0}
      />
      <StatCard value={totalMessages} label="All" />
      <StatCard value={conversationCount} label="Conversations" sublabel={lastConversationAgo} />
    </Stack>
  );
}
