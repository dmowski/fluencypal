import { Stack, Tooltip, Typography } from '@mui/material';
import { Bot, MessageSquareCodeIcon, MessagesSquare, User } from 'lucide-react';
import dayjs from 'dayjs';
import { Conversation } from '@/common/conversation';
import { getConversationsStats } from './getConversationsStats';

interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
}

export function ConversationItem({ conversation, onClick }: ConversationItemProps) {
  const stats = getConversationsStats(conversation);
  const usageKeys = Object.keys(conversation.usage || {});
  const rolePlayId = conversation.rolePlayId;
  const totalUsage = usageKeys.reduce((acc, key) => {
    const price = conversation.usage?.[key] || 0;
    return acc + price;
  }, 0);

  const nowHour = dayjs().hour();
  const isToday =
    conversation.updatedAtIso && dayjs().diff(dayjs(conversation.updatedAtIso), 'hour') <= nowHour;

  return (
    <Stack
      sx={{
        backgroundColor: isToday ? 'rgba(210, 138, 218, 0.21)' : 'rgba(229, 229, 229, 0.21)',
        padding: '10px 15px',
        cursor: 'pointer',
        borderRadius: '8px',
        display: 'grid',
        gridTemplateColumns: '80px 250px 220px 1fr 1fr',
        gap: '10px',
        ':hover': { backgroundColor: 'rgba(229, 229, 229, 0.35)' },
      }}
      onClick={onClick}
    >
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <MessagesSquare size={'18px'} />
        <Typography sx={{}}>{conversation.messagesCount}</Typography>
      </Stack>

      <Typography sx={{}}>{rolePlayId ? rolePlayId : conversation.mode}</Typography>

      <Typography sx={{}}>
        {dayjs(conversation.updatedAtIso).format('DD MMM')} |{' '}
        {conversation.createdAtIso ? dayjs(conversation.createdAtIso).format('HH:mm') : '-'} -{' '}
        {dayjs(conversation.updatedAtIso).format('HH:mm')}
      </Typography>

      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '5px',
            minWidth: '60px',
          }}
        >
          <User />
          <Typography sx={{}}>{stats.userWords}</Typography>
        </Stack>
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '5px',
            minWidth: '60px',
          }}
        >
          <Bot />
          <Typography sx={{}}>{stats.botWords}</Typography>
        </Stack>
      </Stack>

      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '15px',
        }}
      >
        <Tooltip
          slotProps={{
            tooltip: {
              sx: {
                backgroundColor: '#111',
                color: '#fff',
                padding: '10px 14px',
              },
            },
          }}
          title={
            <Stack
              sx={{
                gap: '5px',
              }}
            >
              {usageKeys.map((key) => (
                <Typography key={key}>
                  {`${key}`}: {(conversation.usage?.[key] || 0).toFixed(4)}
                </Typography>
              ))}
            </Stack>
          }
        >
          <Typography>{totalUsage.toFixed(4)} USD</Typography>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
