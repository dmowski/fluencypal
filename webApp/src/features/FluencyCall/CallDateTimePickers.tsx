'use client';

import { Box, IconButton, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dayjs from 'dayjs';
import { useState } from 'react';
import { buildMonthGrid, isLocalDayBefore, localDateKey } from './callTime';

const DEFAULT_MINUTE_STEP = 15;

const pad = (value: number) => String(value).padStart(2, '0');

const minuteOptions = (step: number, currentMinute: number) => {
  const safeStep = step >= 1 && step <= 60 ? Math.floor(step) : DEFAULT_MINUTE_STEP;
  const options: number[] = [];
  for (let value = 0; value < 60; value += safeStep) {
    options.push(value);
  }
  if (
    Number.isInteger(currentMinute) &&
    currentMinute >= 0 &&
    currentMinute <= 59 &&
    !options.includes(currentMinute)
  ) {
    options.push(currentMinute);
    options.sort((a, b) => a - b);
  }
  return options;
};

const dateKey = (year: number, monthIndex: number, day: number) =>
  `${year}-${pad(monthIndex + 1)}-${pad(day)}`;

export const CallDatePicker = ({
  value,
  now,
  onChange,
}: {
  value: string;
  now: Date;
  onChange: (date: string) => void;
}) => {
  const { i18n } = useLingui();
  const [yearText, monthText] = value.split('-');
  const parsedMonth = new Date(Number(yearText), Number(monthText) - 1, 1);
  const valueMonth = Number.isNaN(parsedMonth.getTime())
    ? dayjs(now).startOf('month')
    : dayjs(parsedMonth);
  const [visibleMonth, setVisibleMonth] = useState(valueMonth);
  const [trackedValue, setTrackedValue] = useState(value);
  if (value !== trackedValue) {
    setTrackedValue(value);
    if (!visibleMonth.isSame(valueMonth, 'month')) {
      setVisibleMonth(valueMonth);
    }
  }
  const year = visibleMonth.year();
  const monthIndex = visibleMonth.month();
  const cells = buildMonthGrid(year, monthIndex);
  const weekdayLabels = [0, 1, 2, 3, 4, 5, 6].map((offset) =>
    dayjs(new Date(2026, 0, 5))
      .add(offset, 'day')
      .format('dd'),
  );

  return (
    <Stack data-testid="fluency-call-date-picker" sx={{ gap: '8px' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton
          aria-label={i18n._('Previous month')}
          onClick={() => setVisibleMonth(visibleMonth.subtract(1, 'month'))}
          size="small"
        >
          <ChevronLeft size={18} />
        </IconButton>
        <Typography sx={{ fontWeight: 700 }}>{visibleMonth.format('MMMM YYYY')}</Typography>
        <IconButton
          aria-label={i18n._('Next month')}
          onClick={() => setVisibleMonth(visibleMonth.add(1, 'month'))}
          size="small"
        >
          <ChevronRight size={18} />
        </IconButton>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
        }}
      >
        {weekdayLabels.map((label) => (
          <Typography
            key={label}
            variant="caption"
            sx={{ textAlign: 'center', opacity: 0.55, fontWeight: 700 }}
          >
            {label}
          </Typography>
        ))}
        {cells.map((day, index) => {
          if (day == null) {
            return <Box key={`empty-${index}`} />;
          }
          const key = dateKey(year, monthIndex, day);
          const isSelected = key === value;
          const isPast = isLocalDayBefore(key, now);
          return (
            <Box
              key={key}
              component="button"
              type="button"
              disabled={isPast}
              aria-pressed={isSelected}
              onClick={() => onChange(key)}
              sx={{
                height: 36,
                border: 'none',
                borderRadius: '10px',
                padding: 0,
                font: 'inherit',
                fontSize: '14px',
                backgroundColor: isSelected ? '#2f80ed' : 'transparent',
                color: isPast ? 'rgba(255,255,255,0.28)' : '#fff',
                fontWeight: isSelected ? 700 : 500,
                cursor: isPast ? 'default' : 'pointer',
              }}
            >
              {day}
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
};

export const CallTimePicker = ({
  date,
  time,
  now,
  onChange,
  minuteStep = DEFAULT_MINUTE_STEP,
}: {
  date: string;
  time: string;
  now: Date;
  onChange: (time: string) => void;
  minuteStep?: number;
}) => {
  const { i18n } = useLingui();
  const [hourText, minuteText] = time.split(':');
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const minutes = minuteOptions(minuteStep, minute);
  const minuteColumns = minutes.length > 8 ? 10 : minutes.length;
  const today = localDateKey(now);
  const isToday = date === today;

  const isPastSlot = (nextHour: number, nextMinute: number) => {
    if (!isToday) return false;
    const slot = new Date(now);
    slot.setHours(nextHour, nextMinute, 0, 0);
    return slot.getTime() < now.getTime() - 60 * 1000;
  };

  const firstOpenMinute = (nextHour: number) => {
    const start = isToday && nextHour === now.getHours() ? now.getMinutes() : 0;
    return (
      minutes.find((nextMinute) => nextMinute >= start && !isPastSlot(nextHour, nextMinute)) ??
      minutes.find((nextMinute) => !isPastSlot(nextHour, nextMinute))
    );
  };

  return (
    <Stack data-testid="fluency-call-time-picker" sx={{ gap: '10px' }}>
      <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>
        {i18n._('Time')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
        {Array.from({ length: 24 }, (_, nextHour) => {
          const openMinute = firstOpenMinute(nextHour);
          const disabled = openMinute == null;
          const selected = nextHour === hour;
          return (
            <Box
              key={nextHour}
              component="button"
              type="button"
              data-testid={`fluency-call-hour-${pad(nextHour)}`}
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => {
                const nextMinute = isPastSlot(nextHour, minute) ? openMinute : minute;
                if (nextMinute == null) return;
                onChange(`${pad(nextHour)}:${pad(nextMinute)}`);
              }}
              sx={{
                height: 36,
                border: 'none',
                borderRadius: '10px',
                padding: 0,
                font: 'inherit',
                fontSize: '14px',
                backgroundColor: selected ? '#2f80ed' : 'rgba(255,255,255,0.06)',
                color: disabled ? 'rgba(255,255,255,0.28)' : '#fff',
                fontWeight: selected ? 700 : 500,
                cursor: disabled ? 'default' : 'pointer',
              }}
            >
              {pad(nextHour)}
            </Box>
          );
        })}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${minuteColumns}, 1fr)`,
          gap: '6px',
        }}
      >
        {minutes.map((nextMinute) => {
          const disabled = isPastSlot(hour, nextMinute);
          const selected = nextMinute === minute;
          return (
            <Box
              key={nextMinute}
              component="button"
              type="button"
              data-testid={`fluency-call-minute-${pad(nextMinute)}`}
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onChange(`${pad(hour)}:${pad(nextMinute)}`)}
              sx={{
                height: 36,
                border: 'none',
                borderRadius: '10px',
                padding: 0,
                font: 'inherit',
                fontSize: '14px',
                backgroundColor: selected ? '#2f80ed' : 'rgba(255,255,255,0.06)',
                color: disabled ? 'rgba(255,255,255,0.28)' : '#fff',
                fontWeight: selected ? 700 : 500,
                cursor: disabled ? 'default' : 'pointer',
              }}
            >
              {pad(nextMinute)}
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
};
