import { Stack, Typography } from '@mui/material';
import { StatCard } from './StatCard';

interface AdminMetricsProps {
  todayMessagesCount: number;
  lastHourMessagesCount: number;
  todayUsersCount: number;
  secondDayVisitorsCount: number;
  thirdAndMoreDayVisitorsCount: number;
  usersToShowMode: 'all' | 'today' | 'secondDay' | 'old';
  onModeChange: (mode: 'all' | 'today' | 'secondDay' | 'old') => void;
}

export function AdminMetrics({
  todayMessagesCount,
  lastHourMessagesCount,
  todayUsersCount,
  secondDayVisitorsCount,
  thirdAndMoreDayVisitorsCount,
  usersToShowMode,
  onModeChange,
}: AdminMetricsProps) {
  return (
    <Stack
      sx={{
        width: '100%',
        padding: '20px',
        gap: '12px',
        flexDirection: 'row',
        alignItems: 'center',
        '.stat-card': {
          width: '200px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          alignItems: 'center',
          gap: '0px',
          padding: '17px 12px 8px 12px',
          borderRadius: '8px',
          height: '120px',
          '&.active': {
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
          },
          '.value': {
            fontSize: '30px',
            fontWeight: 600,
          },
          '.label': {
            opacity: 0.9,
          },
        },
      }}
    >
      <StatCard value={todayMessagesCount} label="Today Messages" />

      <StatCard value={lastHourMessagesCount} label="Last Hour Messages" />

      <StatCard
        value={todayUsersCount}
        label="Today Users"
        isActive={usersToShowMode === 'today'}
        onClick={() => onModeChange('today')}
      />

      <StatCard
        value={secondDayVisitorsCount}
        label="Second Day Visitors"
        isActive={usersToShowMode === 'secondDay'}
        onClick={() => onModeChange('secondDay')}
      />

      <StatCard
        value={thirdAndMoreDayVisitorsCount}
        label="Old Visitors"
        isActive={usersToShowMode === 'old'}
        onClick={() => onModeChange('old')}
      />
    </Stack>
  );
}
