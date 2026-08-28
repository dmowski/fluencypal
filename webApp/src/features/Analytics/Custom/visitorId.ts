const VISITOR_ID_PATTERN =
  /^fpv_[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const createVisitorId = (): string => {
  return `fpv_${crypto.randomUUID()}`;
};

export const isValidVisitorId = (visitorId: string): boolean => {
  return VISITOR_ID_PATTERN.test(visitorId);
};
