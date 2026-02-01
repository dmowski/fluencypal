import { Stack, Tooltip, Typography } from '@mui/material';
import { ChevronDown, Circle, CircleCheckBig, Flame } from 'lucide-react';
import { useUsage } from '../Usage/useUsage';
import { useLingui } from '@lingui/react';
import dayjs from 'dayjs';
import { useTasks } from '../Tasks/useTasks';
import { DayTasks, UserTaskType } from '@/common/userTask';

const last5Days: string[] = [];

for (let i = 4; i >= 0; i--) {
  last5Days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'));
}

export const StreaksDaysBadge = () => {
  const { i18n } = useLingui();
  const tasks = useTasks();

  const getDayLabel = (dateStr: string) => {
    const date = dayjs(dateStr);
    return date.format('dd'); // First letter of the day of the week
  };

  const calculateDaysInTheRow = () => {
    let count = 0;
    let currentDate = dayjs().subtract(1, 'day');

    while (true) {
      const dateInFormat = currentDate.format('DD.MM.YYYY');
      const dayStat = tasks.daysTasks?.[dateInFormat];
      if (dayStat) {
        count++;
        currentDate = currentDate.subtract(1, 'day');
      } else {
        break;
      }
    }

    return count;
  };

  const getDayTaskData = (date: string): DayTasks | null => {
    const dateInFormat = dayjs(date).format('DD.MM.YYYY');
    const dayStat = tasks.daysTasks?.[dateInFormat];
    return dayStat || null;
  };

  const getDateStat = (date: string): number => {
    const dayStat = getDayTaskData(date);
    const taskCount = Object.keys(dayStat || {}).length;
    const maxTasksPerDay = 2;
    const percentage = Math.min((taskCount / maxTasksPerDay) * 100, 100);

    return percentage;
  };

  const daysInTheRows = calculateDaysInTheRow();

  return (
    <Stack
      sx={{
        marginBottom: '20px',
        alignItems: 'center',
        gap: '10px',
        flexDirection: 'row',
        justifyContent: 'space-between',

        width: '100%',
        borderRadius: '16px',
        padding: '5px 20px 5px 20px',
        backgroundColor: 'rgba(25, 97, 138, 0.1)',
        border: '1px solid rgba(25, 55, 138, 0.2)',
        flexWrap: 'wrap',
        '@media (max-width:600px)': {
          borderRadius: '0px',
          padding: '5px 20px 5px 20px',
          border: 'none',
        },
      }}
    >
      <Stack>
        <Typography variant="caption">{i18n._('Your Streak')}</Typography>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
          }}
        >
          {daysInTheRows} {i18n._('days in a row!')}
        </Typography>
      </Stack>

      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '15px',
        }}
      >
        {last5Days.map((dateStr, index) => (
          <DayIcon
            key={dateStr}
            progress={getDateStat(dateStr)}
            label={getDayLabel(dateStr)}
            taskData={getDayTaskData(dateStr)}
            isCurrentDay={index === last5Days.length - 1}
            dateStr={dateStr}
          />
        ))}
      </Stack>
    </Stack>
  );
};

const DayIcon = ({
  progress,
  label,
  isCurrentDay,
  taskData,
  dateStr,
}: {
  // 0 to 100
  progress: number;
  label: string;
  isCurrentDay?: boolean;
  taskData: DayTasks | null;

  // ISO date string
  dateStr: string;
}) => {
  const { i18n } = useLingui();
  const taskLabels: Record<UserTaskType, string> = {
    lesson: i18n._('Conversation'),
    words: i18n._('Words'),
    rule: i18n._('Rule'),
    feedback: i18n._('Feedback'),
    chat: i18n._('Community Chat'),
  };
  const tasksToShowInTooltip: UserTaskType[] = ['lesson', 'words', 'rule', 'chat'];
  const activeColor = '#FF3F89';

  const tooltipContent = (
    <Stack
      sx={{
        gap: '15px',
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontWeight: 600,
        }}
      >
        {dayjs(dateStr).isSame(dayjs(), 'day')
          ? i18n._("Today's Tasks")
          : dayjs(dateStr).isSame(dayjs().subtract(1, 'day'), 'day')
            ? i18n._('Yesterday')
            : dayjs(dateStr).format('MMMM D, YYYY')}
      </Typography>
      <Stack
        sx={{
          gap: '15px',
        }}
      >
        {tasksToShowInTooltip.map((taskType) => {
          return (
            <Stack
              key={taskType}
              sx={{
                flexDirection: 'row',
                //justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
                gap: '15px',
              }}
            >
              <Stack>
                {taskData && taskData[taskType] ? (
                  <CircleCheckBig size={'20px'} color="rgb(96, 165, 250)" />
                ) : (
                  <Circle size={'20px'} color="rgba(255, 255, 255, 0.3)" />
                )}
              </Stack>
              <Typography variant="body2">{taskLabels[taskType]}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );

  return (
    <Tooltip
      title={tooltipContent}
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: '#202020',
            padding: '18px 23px 20px 23px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0px 0px 22px rgba(0, 0, 0, 0.5)',
          },
        },
      }}
    >
      <Stack
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack
          sx={{
            opacity: isCurrentDay ? 1 : 0,
          }}
        >
          <ChevronDown
            style={{
              color: activeColor,
            }}
          />
        </Stack>

        <Stack
          sx={{
            position: 'relative',
            width: '42px',
            height: '42px',
            border:
              progress > 0 ? `1px solid ${activeColor}` : '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: progress > 0 ? 'rgba(255, 63, 137, 0.1)' : 'transparent',
            borderRadius: '50%',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Stack
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: `${progress}%`,
              backgroundColor: activeColor,
            }}
          />
          <Flame
            strokeWidth={1.3}
            style={{
              color: progress > 0 ? 'rgb(44, 44, 44)' : 'rgba(255, 63, 137, 0.3)',
              fontSize: '25px',
              position: 'relative',
              zIndex: 1,
              fill: progress > 0 ? 'rgb(44, 44, 44)' : 'rgba(170, 11, 11, 0)',
            }}
          />
        </Stack>
        <Typography
          sx={{
            fontSize: '12px',
            marginTop: '4px',
            opacity: 0.7,
            paddingTop: '4px',
          }}
        >
          {label}
        </Typography>
      </Stack>
    </Tooltip>
  );
};
