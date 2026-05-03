export const getPopoverPositionFromRect = (rect: DOMRect): { top: number; left: number } => ({
  top: rect.bottom + 8,
  left: rect.left + rect.width / 2,
});
