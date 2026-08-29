import { AnalyticsEventName, AnalyticsVisitorDoc } from './types';

export const shouldPersistAnalyticsEvent = (
  eventName: AnalyticsEventName,
  visitorExists: boolean,
): boolean => {
  if (eventName !== 'page_view') return true;
  return visitorExists;
};

export const isReportableVisitor = (
  visitor: Pick<AnalyticsVisitorDoc, 'eventCount' | 'lastEventName'>,
): boolean => {
  return !(visitor.eventCount <= 1 && visitor.lastEventName === 'page_view');
};
