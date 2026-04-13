import { ProgressSourceType } from './types';

export const buildProgressStatId = ({
  sourceType,
  sourceId,
  algorithmVersion,
}: {
  sourceType: ProgressSourceType;
  sourceId: string;
  algorithmVersion: string;
}) => {
  return [sourceType, encodeURIComponent(sourceId), algorithmVersion].join('_');
};
