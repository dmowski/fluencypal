type MousePositionLike = {
  clientX: number;
  clientY: number;
};

export const getPointerPosition = (
  event: MousePositionLike,
  offsetX: number,
  offsetY: number,
): { x: number; y: number } => ({
  x: event.clientX + offsetX,
  y: event.clientY + offsetY,
});
