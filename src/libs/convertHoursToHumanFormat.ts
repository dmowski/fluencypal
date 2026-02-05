export const convertHoursToHumanFormat = (hours: number) => {
  const hoursFull = Math.floor(hours);
  const minutes = Math.floor((hours - hoursFull) * 60);
  if (hours < 1) {
    return `${minutes}min`;
  }

  if (minutes === 0) {
    return `${hoursFull}h`;
  }

  return `${hoursFull}h ${minutes}min`;
};

export const detailedHours = (
  hours: number,
): {
  hours: number;
  minutes: number;
} => {
  const hoursFull = Math.floor(hours);
  const minutes = Math.floor((hours - hoursFull) * 60);
  return {
    hours: Math.max(hoursFull, 0),
    minutes: hours > 0 ? Math.max(minutes, 0) : 0,
  };
};
