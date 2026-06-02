import { randomUUID } from 'node:crypto';
import { modelConfig } from '../config/models.js';
import type { UsageStage, ServerMessage } from '../protocol/messages.js';
import type { ProviderUsage } from '../providers/types.js';
import { toUsageEventPayload } from '../providers/types.js';

export const buildUsageMessage = ({
  stage,
  model,
  usage,
}: {
  stage: UsageStage;
  model: string;
  usage: ProviderUsage;
}): ServerMessage => ({
  type: 'usage',
  usageId: randomUUID(),
  stage,
  model,
  usageEvent: toUsageEventPayload(usage),
  createdAt: Date.now(),
});

export const getPipelineModels = () => modelConfig;
