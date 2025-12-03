import { Link, Stack, Typography } from "@mui/material";
import { maxContentWidth } from "../../Landing/landingSettings";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { InterviewCard } from "./InterviewCard";
import { getAllInterviews } from "../data";

interface ListInterviewProps {
  selectedCategoryId?: string;
  lang: SupportedLanguage;
}
export const ListInterview = ({ lang, selectedCategoryId }: ListInterviewProps) => {
  const { interviews, allCategory, categoriesList } = getAllInterviews(lang);
  const i18n = getI18nInstance(lang);

  const selectedCategory = categoriesList.find((c) => c.categoryId === selectedCategoryId);

  const title = selectedCategoryId
    ? selectedCategory?.categoryTitle || i18n._("Unknown category")
    : allCategory.categoryTitle;

  const listToDisplay = selectedCategoryId
    ? interviews.filter((item) => item.category.categoryId === selectedCategoryId)
    : interviews;

  return (
    <Stack
      sx={{
        width: "100%",
        padding: "80px 0 80px 0",
        alignItems: "center",
        justifyContent: "center",
        gap: "100px",
        backgroundColor: `rgb(255, 253, 249, 1)`,
        position: "relative",
        zIndex: 1,
        "@media (max-width: 924px)": {
          paddingTop: "40px",
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: maxContentWidth,
          width: "100%",
          boxSizing: "border-box",
          padding: "0 10px",
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "80px",
          "@media (max-width: 1100px)": {
            gridTemplateColumns: "1fr",
            gap: "20px",
          },
        }}
      >
        <Stack
          sx={{
            width: "100%",
            gap: "20px",
          }}
        >
          <Typography
            sx={{
              maxWidth: "810px",
              color: "#000",
              fontWeight: 600,
              paddingLeft: "15px",
            }}
          >
            {i18n._(`Discover`)}
          </Typography>
          <Stack component={"nav"} gap={"0px"}>
            {categoriesList.map((category, index) => {
              const isSelected =
                selectedCategoryId === category.categoryId ||
                (!selectedCategoryId && category.categoryId === allCategory.categoryId);
              const isAllScenarios = category.categoryId === allCategory.categoryId;
              return (
                <Link
                  key={index}
                  variant="body2"
                  href={
                    isAllScenarios
                      ? `${getUrlStart(lang)}interview`
                      : `${getUrlStart(lang)}interview?category=${category.categoryId}`
                  }
                  sx={{
                    color: "#000",
                    padding: "10px 15px",
                    borderRadius: "7px",
                    textDecoration: "none",
                    fontWeight: 300,
                    backgroundColor: isSelected ? "rgba(0, 0, 0, 0.05)" : "transparent",
                    ":hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                    },
                  }}
                >
                  {category.categoryTitle}
                </Link>
              );
            })}
          </Stack>
        </Stack>
        <Stack
          component={"main"}
          sx={{
            gap: "20px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Typography
            sx={{
              color: "#000",
              fontWeight: 500,
            }}
            component={"h2"}
            variant="h5"
          >
            {title}
          </Typography>
          {listToDisplay.length === 0 && (
            <Typography
              sx={{
                color: "#000",
              }}
            >
              {i18n._(`No interviews found`)}
            </Typography>
          )}
          <Stack
            sx={{
              display: "grid",
              width: "100%",
              gap: "20px",
              gridTemplateColumns: "1fr",
              justifyContent: "space-between",
            }}
          >
            {listToDisplay.map((item, index) => {
              return (
                <Stack
                  key={index}
                  sx={{
                    width: "100%",
                  }}
                >
                  <InterviewCard item={item} lang={lang} />
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
