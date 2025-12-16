import { PriceSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getPriceSection = (lang: SupportedLanguage): PriceSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "price",
    title: i18n._("Choose your interview preparation plan"),
    subTitle: i18n._("Everything you need to stand out and get the job"),
    prices: [
      {
        id: "1-week-sprint",
        badgeIcon: "⚡",
        badge: i18n._("In a hurry? Perfect for last-minute interviews"),
        label: i18n._("1-Week Sprint"),
        priceUsd: 30,
        description: i18n._(
          "Get fast, intensive preparation. Fix your biggest weaknesses in just 7 days."
        ),
        points: [
          i18n._("7 days full access"),
          i18n._("Daily AI mock interviews"),
          i18n._("Instant feedback on answers"),
          i18n._("Personalized scripts for HR and behavioral questions"),
        ],
        buttonTitle: i18n._("Start 1-Week Sprint — $30"),
      },
      {
        id: "monthly-plan",
        badgeIcon: "⭐",
        badge: i18n._("Best for most job seekers"),
        label: i18n._("Monthly Plan"),
        priceUsd: 60,
        priceLabel: i18n._("Only $2/day"),
        description: i18n._(
          "Consistent improvement with structured interview coaching and personalized practice."
        ),
        points: [
          i18n._("Full access to all simulations"),
          i18n._("Unlimited answer reviews"),
          i18n._("CV-based answer optimization"),
          i18n._("Confidence score tracking"),
          i18n._("Salary negotiation preparation"),
        ],
        buttonTitle: i18n._("Start Monthly Plan — $60"),
        isHighlighted: true,
      },
      {
        id: "4-month-plan",
        badgeIcon: "🎯",
        badge: i18n._("For long job searches & career growth"),
        label: i18n._("4-Month Plan"),
        priceUsd: 90,
        description: i18n._(
          "For people preparing for multiple roles, relocating, switching careers, or targeting senior jobs."
        ),
        points: [
          i18n._("4 months full access"),
          i18n._("Long-term interview strategy"),
          i18n._("Deep skill development"),
          i18n._("Role-specific answer templates"),
          i18n._("Priority feedback queue"),
        ],
        buttonTitle: i18n._("Start 4-Month Plan — $90"),
      },
    ],
  };
};
