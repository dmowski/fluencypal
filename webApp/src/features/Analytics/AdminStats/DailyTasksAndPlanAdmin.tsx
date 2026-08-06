import { Stack, Typography, Tooltip } from '@mui/material';
import { Check, Circle, ListChecks, Loader } from 'lucide-react';
import { DailyTasksAdminSummary } from './adminLearningSummary';
import { DailyTaskType } from '@/features/Tasks/types';

function taskStatusIcon(task: DailyTaskType, completed: Set<DailyTaskType>) {
  if (completed.has(task)) {
    return <Check size={12} color="#81c784" />;
  }
  return <Circle size={12} color="rgba(255,255,255,0.35)" />;
}

interface DailyTasksAdminBlockProps {
  summary: DailyTasksAdminSummary;
}

export function DailyTasksAdminBlock({ summary }: DailyTasksAdminBlockProps) {
  const completed = new Set(summary.completedToday);
  const hasTodayTasks = summary.todayTasks.length > 0;
  const isLastPlanDay = summary.nextDayNumber === summary.dayNumber;

  return (
    <Tooltip
      title={
        <>
          <p>
            Previous active days: {summary.previousActiveDays}
            {summary.languageCode ? ` (${summary.languageCode})` : ''}
          </p>
          <p>Completed today: {summary.completedToday.join(', ') || '—'}</p>
          <p>Assigned today: {summary.todayTasks.join(', ') || '—'}</p>
          <p>
            Next day ({summary.nextDayNumber}): {summary.nextDayTasks.join(', ') || '—'}
          </p>
        </>
      }
    >
      <Stack sx={{ gap: '6px' }}>
        <Stack sx={{ gap: '2px' }}>
          <Typography variant="body2">
            <ListChecks className="icon" /> Day {summary.dayNumber}
            {hasTodayTasks
              ? ` · ${summary.completedToday.length}/${summary.todayTasks.length}`
              : ' · no progress yet'}
          </Typography>
          {hasTodayTasks && (
            <Stack sx={{ gap: '2px', pl: '20px' }}>
              {summary.todayTasks.map((task) => (
                <Stack
                  key={task}
                  direction="row"
                  alignItems="center"
                  gap="6px"
                  sx={{ opacity: completed.has(task) ? 1 : 0.7 }}
                >
                  {taskStatusIcon(task, completed)}
                  <Typography variant="caption">{task}</Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>

        <Stack sx={{ gap: '2px', opacity: 0.85 }}>
          <Typography variant="caption" sx={{ pl: '20px', color: 'rgba(255,255,255,0.65)' }}>
            {isLastPlanDay
              ? `Next day: still Day ${summary.nextDayNumber} (plan end)`
              : `Next · Day ${summary.nextDayNumber}`}
          </Typography>
          <Stack sx={{ gap: '2px', pl: '20px' }}>
            {summary.nextDayTasks.map((task) => (
              <Stack key={`next-${task}`} direction="row" alignItems="center" gap="6px">
                <Circle size={12} color="rgba(255,255,255,0.25)" />
                <Typography variant="caption">{task}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Tooltip>
  );
}

interface LearningPlanAdminBlockProps {
  goalTitle: string | null;
  rows: { title: string; mode: string; status: string }[];
}

export function LearningPlanAdminBlock({ goalTitle, rows }: LearningPlanAdminBlockProps) {
  if (!goalTitle) {
    return (
      <Typography variant="body2" sx={{ opacity: 0.6 }}>
        No learning plan
      </Typography>
    );
  }

  const completedCount = rows.filter((r) => r.status === 'completed').length;
  const activeIndex = rows.findIndex((r) => r.status !== 'completed');

  return (
    <Stack sx={{ gap: '6px', minWidth: '220px' }}>
      <Typography variant="body2">
        Plan: {goalTitle} · {completedCount}/{rows.length}
      </Typography>
      <Stack
        sx={{
          gap: '3px',
          maxHeight: '180px',
          overflow: 'auto',
          pl: '4px',
        }}
      >
        {rows.map((row, index) => {
          const isActive = index === activeIndex && row.status !== 'completed';
          const isDone = row.status === 'completed';
          const isInProgress = row.status === 'in_progress' || row.status === 'started';

          return (
            <Stack
              key={`${row.title}-${index}`}
              direction="row"
              alignItems="flex-start"
              gap="6px"
              sx={{
                opacity: isDone ? 0.55 : 1,
                backgroundColor: isActive ? 'rgba(76, 175, 80, 0.15)' : 'transparent',
                borderRadius: '4px',
                px: '4px',
                py: '2px',
              }}
            >
              {isDone ? (
                <Check size={12} color="#81c784" style={{ marginTop: 2, flexShrink: 0 }} />
              ) : isInProgress || isActive ? (
                <Loader size={12} color="#ffb74d" style={{ marginTop: 2, flexShrink: 0 }} />
              ) : (
                <Circle size={12} color="rgba(255,255,255,0.3)" style={{ marginTop: 2, flexShrink: 0 }} />
              )}
              <Stack sx={{ minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: isActive ? 700 : 400, lineHeight: 1.3 }}
                >
                  {row.title}
                  {isActive ? ' · active' : ''}
                  {isDone ? ' · done' : ''}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.55, lineHeight: 1.2 }}>
                  {row.mode}
                  {row.status !== 'pending' && row.status !== 'completed' ? ` · ${row.status}` : ''}
                </Typography>
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}
