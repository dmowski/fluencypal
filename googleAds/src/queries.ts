export const CUSTOMER_QUERY = `
SELECT
  customer.id,
  customer.descriptive_name,
  customer.currency_code,
  customer.time_zone,
  customer.manager,
  customer.test_account,
  customer.status
FROM customer
LIMIT 1
`.trim();

export const CLIENTS_QUERY = `
SELECT
  customer_client.id,
  customer_client.descriptive_name,
  customer_client.manager,
  customer_client.level,
  customer_client.status,
  customer_client.currency_code,
  customer_client.time_zone,
  customer_client.test_account
FROM customer_client
WHERE customer_client.level <= 1
ORDER BY customer_client.level, customer_client.id
`.trim();

export function campaignsQuery(includeRemoved: boolean): string {
  const where = includeRemoved ? '' : "\nWHERE campaign.status != 'REMOVED'";
  return `
SELECT
  campaign.id,
  campaign.name,
  campaign.status,
  campaign.serving_status,
  campaign.primary_status,
  campaign.primary_status_reasons,
  campaign.advertising_channel_type,
  campaign.bidding_strategy_type,
  campaign_budget.amount_micros,
  campaign_budget.explicitly_shared
FROM campaign${where}
ORDER BY campaign.id
`.trim();
}

export function adGroupsQuery(includeRemoved: boolean): string {
  const where = includeRemoved ? '' : "\nWHERE ad_group.status != 'REMOVED'";
  return `
SELECT
  ad_group.id,
  ad_group.name,
  ad_group.status,
  ad_group.type,
  ad_group.cpc_bid_micros,
  campaign.id,
  campaign.name
FROM ad_group${where}
ORDER BY campaign.id, ad_group.id
`.trim();
}

export function adsQuery(includeRemoved: boolean): string {
  const where = includeRemoved ? '' : "\nWHERE ad_group_ad.status != 'REMOVED'";
  return `
SELECT
  ad_group_ad.ad.id,
  ad_group_ad.ad.name,
  ad_group_ad.ad.type,
  ad_group_ad.ad.final_urls,
  ad_group_ad.ad.responsive_search_ad.headlines,
  ad_group_ad.ad.responsive_search_ad.descriptions,
  ad_group_ad.status,
  ad_group_ad.policy_summary.approval_status,
  ad_group_ad.policy_summary.review_status,
  ad_group.id,
  ad_group.name,
  campaign.id,
  campaign.name
FROM ad_group_ad${where}
ORDER BY campaign.id, ad_group.id, ad_group_ad.ad.id
`.trim();
}

export function keywordsQuery(includeRemoved: boolean): string {
  const removed = includeRemoved ? '' : "\n  AND ad_group_criterion.status != 'REMOVED'";
  return `
SELECT
  ad_group_criterion.criterion_id,
  ad_group_criterion.keyword.text,
  ad_group_criterion.keyword.match_type,
  ad_group_criterion.status,
  ad_group.id,
  ad_group.name,
  campaign.id,
  campaign.name
FROM ad_group_criterion
WHERE ad_group_criterion.type = 'KEYWORD'${removed}
ORDER BY campaign.id, ad_group.id
`.trim();
}

export const METRICS_QUERY = `
SELECT
  campaign.id,
  campaign.name,
  metrics.impressions,
  metrics.clicks,
  metrics.cost_micros,
  metrics.conversions
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
`.trim();

export function changeEventQuery(days: 7 | 14 | 30, now = new Date()): string {
  // LAST_30_DAYS starts on a date Google rejects as older than 30 days.
  const span = days === 30 ? 29 : days;
  const start = new Date(now.getTime() - span * 24 * 60 * 60 * 1000);
  const format = (date: Date) => date.toISOString().slice(0, 19).replace('T', ' ');
  return `
SELECT
  change_event.resource_name,
  change_event.change_date_time,
  change_event.change_resource_type,
  change_event.change_resource_name,
  change_event.client_type,
  change_event.user_email,
  change_event.resource_change_operation,
  change_event.changed_fields,
  campaign.id,
  campaign.name,
  ad_group.id,
  ad_group.name
FROM change_event
WHERE change_event.change_date_time >= '${format(start)}'
  AND change_event.change_date_time <= '${format(now)}'
ORDER BY change_event.change_date_time DESC
LIMIT 10000
`.trim();
}
