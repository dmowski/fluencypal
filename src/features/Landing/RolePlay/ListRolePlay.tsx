import { Link, Stack, Typography } from "@mui/material";
import { maxContentWidth } from "../landingSettings";
import { getRolePlayScenarios } from "@/features/RolePlay/rolePlayData";
import { RolePlayCard } from "./RolePlayCard";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

interface ListRolePlayProps {
  selectedCategory?: string;
  lang: SupportedLanguage;
}
export const ListRolePlay = ({ lang, selectedCategory }: ListRolePlayProps) => {
  const rolePlayScenarios = getRolePlayScenarios(lang);
  const i18n = getI18nInstance(lang);
  const allScenarios = i18n._(`All scenarios`);

  const categoryList = rolePlayScenarios.reduce((acc, scenario) => {
    if (!acc.includes(scenario.category)) {
      acc.push(scenario.category);
    }
    return acc;
  }, [] as string[]);
  categoryList.unshift(allScenarios);

  const title = selectedCategory || allScenarios;

  const listToDisplay = selectedCategory
    ? rolePlayScenarios.filter((scenario) => scenario.category === selectedCategory)
    : rolePlayScenarios;

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
                      ? `/${lang}/scenarios`
                      : `/${lang}/scenarios?category=${category}`
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
          <Stack
            sx={{
              display: "grid",
              width: "100%",
              gap: "20px",
              gridTemplateColumns: "1fr 1fr",
              justifyContent: "space-between",
              "@media (max-width: 1224px)": {
                gridTemplateColumns: "1fr 1fr",
              },

              "@media (max-width: 724px)": {
                gridTemplateColumns: "1fr",
              },
            }}
          >
            {listToDisplay.map((scenario, index) => {
              return (
                <Stack
                  key={index}
                  sx={{
                    width: "100%",
                  }}
                >
                  <RolePlayCard scenario={scenario} lang={lang} />
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
