import { Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { InterviewData } from "../types";

interface InterviewCardProps {
  item: InterviewData;
  lang: string;
}

export const InterviewCard: React.FC<InterviewCardProps> = ({ item, lang }) => {
  const i18n = getI18nInstance(lang);
  return (
    <Stack
      component={"a"}
      href={`${getUrlStart(lang)}interview/${item.id}`}
      sx={{
        position: "relative",
        backgroundColor: "rgba(0, 0, 10, 0.01)",
        color: "#111",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "calc(100vw - 30px)",
        alignItems: "flex-start",
        cursor: "pointer",
        borderRadius: "15px",
        overflow: "hidden",
        textAlign: "left",
        padding: "0px",
        boxSizing: "border-box",
        textDecoration: "none",

        ":hover": {
          border: "1px solid rgba(0, 0, 0, 0.3)",
        },
      }}
    >
      <Stack
        sx={{
          padding: "30px 20px 40px 20px",
          boxSizing: "border-box",
          width: "100%",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <Stack>
          <Typography
            variant={"h5"}
            component={"h3"}
            sx={{
              fontWeight: 600,
              color: "#121214",
            }}
          >
            {item.title}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#666",
              paddingTop: "0px",
              fontSize: "1rem",
            }}
          >
            {item.subTitle}
          </Typography>
        </Stack>

        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "flex-start",
            flexDirection: "row",
            gap: "10px",
            padding: "30px 0 10px 0",
          }}
        >
          <Typography
            sx={{
              textDecoration: "underline",
              textUnderlineOffset: "8px",
              fontWeight: 550,
            }}
            className="link-text"
          >
            {i18n._(`Read more`)}
            <ArrowForwardIcon
              className="link-icon"
              sx={{
                position: "relative",
                top: "6px",
                left: "4px",
                fontSize: "1rem",
                transition: "left 0.3s",
              }}
            />
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
