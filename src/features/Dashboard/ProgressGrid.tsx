import React from "react";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";

const colorMap = [
  "rgba(5, 172, 255, 0.03)",
  "rgba(5, 172, 255, 0.3)",
  "rgba(5, 172, 255, 0.8)",
  "rgba(5, 172, 255, 1)",
];

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
  const daysToShow = 365;
  const startDate = dayjs(startDateTimeStamp);
  // endDate - startDate + daysToShow
  const endDate = startDate.add(daysToShow - 1, "day");

  const days = Array.from({ length: endDate.diff(startDate, "day") + 1 }, (_, i) =>
    startDate.add(i, "day")
  );
  const currentDayString = dayjs(currentDateTimeStamp).format("DD.MM.YYYY");
  const progressWidth = "1292px";

  // Generate month labels from startDateTimeStamp to currentDateTimeStamp
  const months = Array.from({ length: endDate.diff(startDate, "month") + 1 }, (_, i) =>
    startDate.add(i, "month").format("MMM")
  );

  return (
    <Stack
      sx={{
        position: "relative",
        width: "100%",
        height: "170px",
      }}
    >
      <Stack
        sx={{
          height: "140px",
          width: progressWidth,
          borderRadius: "6px",
          padding: "2px",
          flexWrap: "wrap",
          gap: "8px 1px",
          position: "absolute",
          top: "0",
          left: "0",
        }}
      >
        {days.map((date, index) => {
          const dateString = date.format("DD.MM.YYYY");
          const level = Math.min(getDateStat(dateString), colorMap.length - 1);

          const dateTooltipLabel = date.format("DD MMM");

          const isToday = dateString === currentDayString;
          const isFuture = date.isAfter(dayjs(currentDateTimeStamp));
          const tooltipLabel = `${dateTooltipLabel}: ${getDateStat(dateString)} activities`;
          return (
            <Tooltip
              key={index}
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
                  width: 12,
                  height: 12,
                  bgcolor: colorMap[level],
                  borderRadius: "2px",
                  boxSizing: "border-box",
                  boxShadow: isToday
                    ? "0 0 0 1px #fff"
                    : isFuture
                      ? "0 0 0 1px rgba(255, 255, 255, 0.1)"
                      : "0 0 0 1px rgba(255, 255, 255, 0.1)",
                }}
              />
            </Tooltip>
          );
        })}
      </Stack>
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "center",
          height: "20px",
          width: progressWidth,
          borderRadius: "6px",
          padding: "2px 10px",
          boxSizing: "border-box",
          gap: "3px",
          position: "absolute",
          bottom: "0",
          left: "0",
          justifyContent: "space-between",
        }}
      >
        {months.map((month, index) => (
          <Typography key={index} variant="caption" sx={{ textAlign: "center", opacity: 0.6 }}>
            {month}
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
};
