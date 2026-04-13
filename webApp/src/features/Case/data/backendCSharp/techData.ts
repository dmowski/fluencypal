import { TechItem } from '../../types';
import { SupportedLanguage } from '@/features/Lang/lang';
import { getI18nInstance } from '@/appRouterI18n';

export const getBackendTechData = (lang: SupportedLanguage) => {
  const i18n = getI18nInstance(lang);
  const dotnet: TechItem = {
    label: i18n._('.NET'),
    logoUrl: 'https://cdn.simpleicons.org/dotnet/512BD4',
  };

  const aspnetCore: TechItem = {
    label: i18n._('ASP.NET Core'),
    logoUrl: 'https://cdn.simpleicons.org/dotnet/512BD4',
  };

  const efCore: TechItem = {
    label: i18n._('EF Core'),
    logoUrl: 'https://cdn.simpleicons.org/dotnet/512BD4',
  };

  const csharp: TechItem = {
    label: i18n._('C#'),
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Logo_C_sharp.svg',
  };

  const sql: TechItem = {
    label: i18n._('SQL'),
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Sql_data_base_with_logo.png',
  };

  const nosql: TechItem = {
    label: i18n._('NoSQL'),
    logoUrl: 'https://cdn.simpleicons.org/mongodb/47A248',
  };

  const redis: TechItem = {
    label: i18n._('Redis'),
    logoUrl: 'https://cdn.simpleicons.org/redis/DC382D',
  };

  const queues: TechItem = {
    label: i18n._('Queues'),
    logoUrl: '/interview/apachekafka.png',
  };

  const systemDesign: TechItem = {
    label: i18n._('System Design'),
    logoUrl: 'https://cdn.simpleicons.org/diagramsdotnet/F08705',
  };

  const circuitBreaker: TechItem = {
    label: i18n._('Circuit Breaker'),
    logoUrl: 'https://cdn.simpleicons.org/cloudflare/F38020',
  };

  const retryBackoff: TechItem = {
    label: i18n._('Retry & Backoff'),
    logoUrl: 'https://cdn.simpleicons.org/apacheairflow/017CEE',
  };

  const observability: TechItem = {
    label: i18n._('Logging/Tracing'),
    logoUrl: 'https://cdn.simpleicons.org/grafana/F46800',
  };

  const unitTests: TechItem = {
    label: i18n._('Unit Tests'),
    logoUrl: 'https://cdn.simpleicons.org/jest/C21325',
  };

  const integrationTests: TechItem = {
    label: i18n._('Integration Tests'),
    logoUrl:
      'https://cdn.brandfetch.io/idIq_kF0rb/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1667565306852',
  };

  const contractTests: TechItem = {
    label: i18n._('Contract Tests'),
    logoUrl: 'https://cdn.simpleicons.org/postman/FF6C37',
  };

  return {
    dotnet,
    'aspnet-core': aspnetCore,
    'ef-core': efCore,
    csharp,
    sql,
    nosql,
    redis,
    queues,
    'system-design': systemDesign,
    'circuit-breaker': circuitBreaker,
    'retry-backoff': retryBackoff,
    observability,
    'unit-tests': unitTests,
    'integration-tests': integrationTests,
    'contract-tests': contractTests,
  } as const;
};
