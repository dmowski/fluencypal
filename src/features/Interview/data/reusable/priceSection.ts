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
      /*{
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
      },*/
      {
        id: "monthly-plan",
        badgeIcon: "⭐",
        badge: i18n._("Best for most job seekers"),
        label: i18n._("Monthly Plan"),
        priceUsd: 9,
        priceLabel: i18n._("/ month"),
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
        buttonTitle: i18n._("Start Monthly Plan"),
        isHighlighted: true,
      },
      {
        id: "advanced-plan",
        badgeIcon: "🎯",
        badge: i18n._("For long job searches & career growth"),
        priceValue: i18n._("Custom pricing"),
        label: i18n._("Advanced Plan"),
        description: i18n._(
          "For people seeking long-term career growth and comprehensive interview preparation."
        ),
        points: [
          i18n._("Custom interview roadmap"),
          i18n._("New features & simulations added regularly"),
          i18n._("Priority support"),
          i18n._("Early access to new tools"),
        ],
        buttonTitle: i18n._("Contact us"),
        buttonHref: "/contacts",
      },
    ],
  };
};
