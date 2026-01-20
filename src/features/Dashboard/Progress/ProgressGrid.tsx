import React from "react";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";

export const colorMap = ["#0a131c", "#0c3156", "#104982", "#1f8abd"];

interface MonthProgressBlockProps {
  month: number;
  currentDateTimeStamp: number;
  year: number;
  getDateStat: (data: string) => number;
  daySize: number;
  gap: string;
}

export const MonthProgressBlock: React.FC<MonthProgressBlockProps> = ({
  month,
  year,
  currentDateTimeStamp,
  getDateStat,
  daySize,
  gap,
}) => {
  const daysInMonth = dayjs().month(month).year(year).daysInMonth();

  const startDate = dayjs().year(year).month(month).date(1);
  const endDate = dayjs().year(year).month(month).date(daysInMonth);

  const thisMonthDays = Array.from({ length: daysInMonth }, (_, i) =>
    startDate.add(i, "day"),
  );
  const weekDayFirstDay = startDate.day() === 0 ? 6 : startDate.day() - 1;
  const weekDayLastDay = endDate.day() === 0 ? 6 : endDate.day() - 1;
  const isNeedToRemoveLastWeek = weekDayLastDay !== 6;

  const needGhostDays = weekDayFirstDay;
  const ghostBeforeDays = Array.from({ length: needGhostDays }, (_, i) =>
    startDate.subtract(i + 1, "day"),
  );

  const days = [...ghostBeforeDays.reverse(), ...thisMonthDays];
  const numberOfColumns =
    Math.ceil(days.length / 7) - (isNeedToRemoveLastWeek ? 1 : 0);
  const daysToShow = isNeedToRemoveLastWeek
    ? days.length - weekDayLastDay - 1
    : days.length;

  const currentDayString = dayjs(currentDateTimeStamp).format("DD.MM.YYYY");

  const monthTitle = startDate.format("MMM");

  return (
    <Stack
      sx={{
        width: "max-content",
        gap: "12px",
        padding: "2px 0",
      }}
    >
      <Stack
        sx={{
          width: "max-content",
          display: "grid",
          gridTemplateColumns: `repeat(${numberOfColumns}, 1fr)`,
          gridTemplateRows: `repeat(7, 1fr)`,
          gap: gap,
          gridAutoFlow: "column",
        }}
      >
        {days
          .filter((_, index) => index < daysToShow)
          .map((date, index) => {
            const dateString = date.format("DD.MM.YYYY");
            const level = Math.min(
              getDateStat(dateString),
              colorMap.length - 1,
            );

            const dateTooltipLabel = date.format("DD MMM");

            const isToday = dateString === currentDayString;
            const isFuture = date.isAfter(dayjs(currentDateTimeStamp));
            const tooltipLabel = `${dateTooltipLabel}: ${getDateStat(dateString)} activities`;
            return (
              <Tooltip
                key={index + dateString}
                title={tooltipLabel}
                arrow
                slotProps={{
                  popper: {
                    sx: {
                      pointerEvents: "none",
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    width: daySize,
                    height: daySize,
                    margin: "0",
                    padding: "0",
                    bgcolor: colorMap[level],
                    borderRadius: "2px",
                    boxSizing: "border-box",
                    boxShadow: isToday
                      ? "0 0 0 1px #c2c2c2"
                      : isFuture
                        ? "0 0 0 1px rgba(55, 55, 55, 1)"
                        : "0 0 0 1px rgba(55, 55, 55, 1)",
                  }}
                />
              </Tooltip>
            );
          })}
      </Stack>
      <Typography
        variant="caption"
        sx={{
          opacity: 0.4,
          alignItems: "center",
        }}
        align="center"
      >
        {monthTitle}
      </Typography>
    </Stack>
  );
};

interface ProgressGridProps {
  currentDateTimeStamp: number;
  startDateTimeStamp: number;
  getDateStat: (data: string) => number;
}

export const ProgressGrid: React.FC<ProgressGridProps> = ({
  startDateTimeStamp,
  currentDateTimeStamp,
  getDateStat,
}) => {
  const startDate = dayjs(startDateTimeStamp);
  const endDate = dayjs(currentDateTimeStamp).add(12, "month");

  const monthsAndYears: { month: number; year: number }[] = [];
  let currentDate = startDate;
  do {
    monthsAndYears.push({
      month: currentDate.month(),
      year: currentDate.year(),
    });
    currentDate = currentDate.add(1, "month");
  } while (currentDate.isBefore(endDate));

  return (
    <Stack
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: "1302px",
        overflowX: "hidden",
      }}
    >
      <Stack
        sx={{
          flexDirection: "row",
          width: "max-content",
          gap: "7px",
          padding: "0px 0 20px 1px",
        }}
      >
        {monthsAndYears.map((date, index) => (
          <MonthProgressBlock
            gap="7px"
            daySize={22}
            key={index}
            month={date.month}
            year={date.year}
            currentDateTimeStamp={currentDateTimeStamp}
            getDateStat={getDateStat}
          />
        ))}
      </Stack>
    </Stack>
  );
};
