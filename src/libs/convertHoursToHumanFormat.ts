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
