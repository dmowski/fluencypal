import { ReviewSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getBackendReviewSection = (
  lang: SupportedLanguage,
): ReviewSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "review",
    title: i18n._("Real results. Real offers."),
    subTitle: i18n._("Backend engineers who improved their interviews"),
    reviews: [
      {
        name: "Nina K.",
        jobTitle: "Backend Developer",
        rate: 5,
        review: i18n._(
          "The API versioning and resiliency practice helped me answer confidently. I got an offer in two weeks.",
        ),
      },
      {
        name: "Omar S.",
        jobTitle: "Senior Backend Engineer",
        rate: 5,
        review: i18n._(
          "Clear structure for system design. I finally explained trade-offs without rambling.",
        ),
      },
      {
        name: "Lena P.",
        jobTitle: ".NET Engineer",
        rate: 4,
        review: i18n._(
          "EF Core insights were spot-on. The demo feedback made my answers sharper.",
        ),
      },
    ],
  };
};
