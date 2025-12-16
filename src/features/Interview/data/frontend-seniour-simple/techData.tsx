import { getI18nInstance } from "@/appRouterI18n";
import { TechItem } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";

export const getTechData = (lang: SupportedLanguage): Record<string, TechItem> => {
  const i18n = getI18nInstance(lang);

  const reactTech: TechItem = {
    label: i18n._("React & Next.js"),
    logoUrl: "https://cdn.simpleicons.org/react",
  };

  const vueTech: TechItem = {
    label: i18n._("Vue & Pinia"),
    logoUrl: "https://cdn.simpleicons.org/vuedotjs",
  };

  const angularTech: TechItem = {
    label: i18n._("Angular & RxJS"),
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/67/Angular_gradient_logo.png",
  };

  const typescriptTech: TechItem = {
    label: i18n._("TypeScript"),
    logoUrl: "https://cdn.simpleicons.org/typescript",
  };

  const systemDesignTech: TechItem = {
    label: i18n._("Frontend System Design"),
    logoUrl: "https://cdn.simpleicons.org/lighthouse",
  };

  const microfrontendsTech: TechItem = {
    label: i18n._("Micro-frontends"),
    logoUrl: "https://cdn.simpleicons.org/webpack",
  };

  const stateManagementTech: TechItem = {
    label: i18n._("State Management"),
    logoUrl: "https://cdn.simpleicons.org/redux",
  };

  const componentLibrariesTech: TechItem = {
    label: i18n._("Component Libraries"),
    logoUrl: "https://cdn.simpleicons.org/storybook",
  };

  const renderingPerformanceTech: TechItem = {
    label: i18n._("Rendering Performance"),
    logoUrl: "https://cdn.simpleicons.org/googlechrome",
  };

  const bundlingTech: TechItem = {
    label: i18n._("Bundling & Code Splitting"),
    logoUrl: "https://cdn.simpleicons.org/rollupdotjs",
  };

  const lazyLoadingTech: TechItem = {
    label: i18n._("Lazy Loading"),
    logoUrl: "https://cdn.simpleicons.org/javascript",
  };

  const cachingTech: TechItem = {
    label: i18n._("Caching Strategies"),
    logoUrl: "https://cdn.simpleicons.org/cloudflare",
  };

  const jestTech: TechItem = {
    label: i18n._("Jest & React Testing Library"),
    logoUrl: "https://cdn.simpleicons.org/jest",
  };

  const cypressTech: TechItem = {
    label: i18n._("Cypress & E2E Testing"),
    logoUrl: "https://cdn.simpleicons.org/cypress",
  };

  const integrationTestingTech: TechItem = {
    label: i18n._("Integration Testing"),
    logoUrl: "https://cdn.simpleicons.org/githubactions",
  };

  const wcagTech: TechItem = {
    label: i18n._("WCAG Standards"),
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/51/W3C.svg",
  };

  const semanticHtmlTech: TechItem = {
    label: i18n._("Semantic HTML"),
    logoUrl: "https://cdn.simpleicons.org/html5",
  };

  const performanceMetricsTech: TechItem = {
    label: i18n._("Performance Metrics"),
    logoUrl: "https://cdn.simpleicons.org/lighthouse",
  };

  const coreWebVitalsTech: TechItem = {
    label: i18n._("Core Web Vitals"),
    logoUrl: "https://cdn.simpleicons.org/pagespeedinsights",
  };
  return {
    "react-nextjs": reactTech,
    "vue-pinia": vueTech,
    "angular-rxjs": angularTech,
    typescript: typescriptTech,
    "frontend-system-design": systemDesignTech,
    "micro-frontends": microfrontendsTech,
    "state-management": stateManagementTech,
    "component-libraries": componentLibrariesTech,
    "rendering-performance": renderingPerformanceTech,
    "bundling-code-splitting": bundlingTech,
    "lazy-loading": lazyLoadingTech,
    "caching-strategies": cachingTech,
    "jest-react-testing-library": jestTech,
    "cypress-e2e-testing": cypressTech,
    "integration-testing": integrationTestingTech,
    "wcag-standards": wcagTech,
    "semantic-html": semanticHtmlTech,
    "performance-metrics": performanceMetricsTech,
    "core-web-vitals": coreWebVitalsTech,
  };
};
