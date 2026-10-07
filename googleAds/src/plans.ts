import {
  adGroupResourceName,
  currencyToMicros,
  normalizeCustomerId,
  validateResponsiveSearchAd,
  type AdStatus,
  type KeywordMatchType,
} from './validate.js';

export type ApplyMode = 'dry-run' | 'validate' | 'apply';

export function resolveApplyMode(flags: { confirm?: boolean; validate?: boolean }): ApplyMode {
  if (flags.confirm && flags.validate) {
    throw new Error('Use either --confirm to apply the change or --validate to check it, not both.');
  }
  if (flags.confirm) return 'apply';
  if (flags.validate) return 'validate';
  return 'dry-run';
}

export function buildStatusMutation(input: {
  resourceName: string;
  status: AdStatus;
  validateOnly: boolean;
}): { operations: unknown[]; validateOnly?: boolean } {
  return {
    ...(input.validateOnly ? { validateOnly: true } : {}),
    operations: [
      {
        update: { resourceName: input.resourceName, status: input.status },
        updateMask: 'status',
      },
    ],
  };
}

export function buildRemoveMutation(input: {
  resourceName: string;
  validateOnly: boolean;
}): { operations: unknown[]; validateOnly?: boolean } {
  return {
    ...(input.validateOnly ? { validateOnly: true } : {}),
    operations: [{ remove: input.resourceName }],
  };
}

export function buildResponsiveSearchAdMutation(input: {
  customerId: string;
  adGroupId: string;
  finalUrl: string;
  headlines: string[];
  descriptions: string[];
  status: AdStatus;
  validateOnly: boolean;
}): { operations: unknown[]; validateOnly?: boolean } {
  const ad = validateResponsiveSearchAd(input);
  return {
    ...(input.validateOnly ? { validateOnly: true } : {}),
    operations: [
      {
        create: {
          adGroup: adGroupResourceName(input.customerId, input.adGroupId),
          status: input.status,
          ad: {
            finalUrls: [ad.finalUrl],
            responsiveSearchAd: {
              headlines: ad.headlines.map((text) => ({ text })),
              descriptions: ad.descriptions.map((text) => ({ text })),
            },
          },
        },
      },
    ],
  };
}

export type SearchCampaignPlanInput = {
  customerId: string;
  name: string;
  dailyBudget: string;
  finalUrl: string;
  headlines: string[];
  descriptions: string[];
  keywords: Array<{ text: string; matchType: KeywordMatchType }>;
  status: AdStatus;
  validateOnly: boolean;
};

export function buildSearchCampaignMutation(input: SearchCampaignPlanInput): {
  mutateOperations: unknown[];
  validateOnly?: boolean;
} {
  const customerId = normalizeCustomerId(input.customerId);
  const name = input.name.trim();
  if (!name) throw new Error('Campaign name is required.');
  const ad = validateResponsiveSearchAd(input);
  const budgetResource = `customers/${customerId}/campaignBudgets/-1`;
  const campaignResource = `customers/${customerId}/campaigns/-2`;
  const adGroupResource = `customers/${customerId}/adGroups/-3`;

  const mutateOperations: unknown[] = [
    {
      campaignBudgetOperation: {
        create: {
          resourceName: budgetResource,
          name: `${name} budget`,
          amountMicros: currencyToMicros(input.dailyBudget),
          deliveryMethod: 'STANDARD',
          explicitlyShared: false,
        },
      },
    },
    {
      campaignOperation: {
        create: {
          resourceName: campaignResource,
          name,
          advertisingChannelType: 'SEARCH',
          status: input.status,
          campaignBudget: budgetResource,
          manualCpc: {},
          containsEuPoliticalAdvertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING',
          networkSettings: {
            targetGoogleSearch: true,
            targetSearchNetwork: true,
            targetContentNetwork: false,
            targetPartnerSearchNetwork: false,
          },
        },
      },
    },
    {
      adGroupOperation: {
        create: {
          resourceName: adGroupResource,
          name: `${name} ad group`,
          campaign: campaignResource,
          status: 'ENABLED',
          type: 'SEARCH_STANDARD',
          cpcBidMicros: '1000000',
        },
      },
    },
  ];

  for (const keyword of input.keywords) {
    mutateOperations.push({
      adGroupCriterionOperation: {
        create: {
          adGroup: adGroupResource,
          status: 'ENABLED',
          keyword: { text: keyword.text, matchType: keyword.matchType },
        },
      },
    });
  }

  mutateOperations.push({
    adGroupAdOperation: {
      create: {
        adGroup: adGroupResource,
        status: input.status,
        ad: {
          finalUrls: [ad.finalUrl],
          responsiveSearchAd: {
            headlines: ad.headlines.map((text) => ({ text })),
            descriptions: ad.descriptions.map((text) => ({ text })),
          },
        },
      },
    },
  });

  return {
    ...(input.validateOnly ? { validateOnly: true } : {}),
    mutateOperations,
  };
}
