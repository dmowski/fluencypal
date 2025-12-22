import { Button, Stack, Typography } from "@mui/material";
import { CheckCircle2 } from "lucide-react";
import { H2, SubTitle } from "./Typography";
import { TextListItem } from "../../types";
import { DynamicIcon } from "lucide-react/dynamic";
import { Markdown } from "@/features/uiKit/Markdown/Markdown";
import { red } from "@mui/material/colors";
import { Theme, themeMap } from "./theme";

export interface TextListProps {
  id: string;
  title: string;
  subTitle: string;
  textList: TextListItem[];
  buttonTitle?: string;
  buttonHref?: string;
  theme: Theme;
}

export const TextListSection = (props: TextListProps) => {
  const colors = themeMap[props.theme];

  return (
    <Stack
      id={props.id}
      sx={{
        padding: "150px 0",
        alignItems: "center",
        width: "100%",
        backgroundColor: colors.sectionBgColor,
        color: colors.textColor,

        "@media (max-width: 600px)": {
          padding: "90px 0 50px 0",
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: "1300px",
          width: "100%",
          gap: "24px",
          padding: "0 10px",
        }}
      >
        <Stack
          sx={{
            gap: "10px",
          }}
        >
          <H2 align="left">{props.title}</H2>
          <SubTitle align="left">{props.subTitle}</SubTitle>
        </Stack>

        <Stack
          sx={{
            gap: "14px",
            marginTop: "26px",
            "@media (max-width: 600px)": {
              gap: "20px",
            },
          }}
        >
          {props.textList.map((item, index) => (
            <Stack
              key={index}
              sx={{
                gap: "12px",
                alignItems: "center",
                display: "grid",
                gridTemplateColumns: "max-content 1fr",
              }}
            >
              <DynamicIcon
                name={item.iconName || "check-circle-2"}
                size={22}
                color={item.iconColor || "#4caf50"}
              />
              <Typography
                component={"div"}
                variant="body1"
                sx={{
                  fontSize: "18px",
                  lineHeight: 1.6,

                  paddingTop: "2px",
                  fontWeight: 400,
                  color: "rgba(255, 255, 255, 0.8)",
                  strong: {
                    color: "rgba(255, 255, 255, 1)",
                    fontWeight: 750,
                  },
                }}
              >
                <Markdown>{item.title}</Markdown>
              </Typography>
            </Stack>
          ))}
        </Stack>

        {props.buttonTitle && props.buttonHref && (
          <Stack alignItems="center">
            <Button
              href={props.buttonHref}
              variant="contained"
              size="large"
              color="info"
              sx={{
                marginTop: "32px",
                borderRadius: "48px",
                fontSize: "16px",
              }}
            >
              {props.buttonTitle}
            </Button>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
