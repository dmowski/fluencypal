import { Link, Stack, Typography } from "@mui/material";
import { maxContentWidth } from "../Landing/landingSettings";
import { SupportedLanguage } from "@/common/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { getBlogs } from "./blogData";
import { BlogCard } from "./BlogCard";

interface ListBlogProps {
  selectedCategory?: string;
  lang: SupportedLanguage;
}
export const ListBlog = ({ lang, selectedCategory }: ListBlogProps) => {
  const blogs = getBlogs(lang);
  const i18n = getI18nInstance(lang);
  const allScenarios = i18n._(`All blogs`);

  const categoryList = blogs.reduce((acc, scenario) => {
    if (!acc.includes(scenario.category)) {
      acc.push(scenario.category);
    }
    return acc;
  }, [] as string[]);
  categoryList.unshift(allScenarios);

  const title = selectedCategory || allScenarios;

  const listToDisplay = selectedCategory
    ? blogs.filter((item) => item.category === selectedCategory)
    : blogs;

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
            {categoryList.map((category, index) => {
              const isSelected =
                selectedCategory === category || (!selectedCategory && category === allScenarios);
              const isAllScenarios = category === allScenarios;
              return (
                <Link
                  key={index}
                  variant="body2"
                  href={
                    isAllScenarios
                      ? `${getUrlStart(lang)}blog`
                      : `${getUrlStart(lang)}blog?category=${category}`
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
                  {category}
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
              {i18n._(`No blogs found`)}
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
                  <BlogCard blog={item} lang={lang} />
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
