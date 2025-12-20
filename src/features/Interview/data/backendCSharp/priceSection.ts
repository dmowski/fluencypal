import { PriceSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getBackendPriceSection = (lang: SupportedLanguage): PriceSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "price",
    title: i18n._("Choose your backend prep plan"),
    subTitle: i18n._("Everything you need for APIs, data, resiliency, and system design"),
    prices: [
      {
        id: "1-week-sprint",
        badgeIcon: "⚡",
        badge: i18n._("Last-minute backend prep"),
        label: i18n._("1-Week Sprint"),
        priceUsd: 30,
        description: i18n._(
          "Tighten core backend answers fast: API design, EF Core, concurrency, and resiliency basics."
        ),
        points: [
          i18n._("7 days full access"),
          i18n._("Daily backend mock interviews"),
          i18n._("Instant feedback on API and data answers"),
          i18n._("Scripts for behavioral and architecture questions"),
        ],
        buttonTitle: i18n._("Start 1-Week Sprint — $30"),
      },
      {
        id: "monthly-plan",
        badgeIcon: "⭐",
        badge: i18n._("Best for most engineers"),
        label: i18n._("Monthly Plan"),
        priceUsd: 60,
        priceLabel: i18n._("Only $2/day"),
        description: i18n._(
          "Build strong, repeatable answers across APIs, databases, concurrency, and system design."
        ),
        points: [
          i18n._("Full access to backend simulations"),
          i18n._("Unlimited answer reviews"),
          i18n._("Role-specific scripts for .NET roles"),
          i18n._("Score tracking and improvement plan"),
          i18n._("Negotiation and stakeholder stories"),
        ],
        buttonTitle: i18n._("Start Monthly Plan — $60"),
        isHighlighted: true,
      },
      {
        id: "4-month-plan",
        badgeIcon: "🎯",
        badge: i18n._("For longer searches & senior roles"),
        label: i18n._("4-Month Plan"),
        priceUsd: 90,
        description: i18n._(
          "Prepare for multiple interviews, deeper system design, and advanced resiliency scenarios."
        ),
        points: [
          i18n._("4 months full access"),
          i18n._("Long-term backend interview strategy"),
          i18n._("Advanced system design drills"),
          i18n._("Role-specific templates for .NET"),
          i18n._("Priority feedback queue"),
        ],
        buttonTitle: i18n._("Start 4-Month Plan — $90"),
      },
    ],
  };
};
