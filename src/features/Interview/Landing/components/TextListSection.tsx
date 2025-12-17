import { Button, Stack, Typography } from "@mui/material";
import { CheckCircle2 } from "lucide-react";
import { H2, SubTitle } from "./Typography";
import { TextListItem } from "../../types";
import { DynamicIcon } from "lucide-react/dynamic";

export interface TextListProps {
  id: string;
  title: string;
  subTitle: string;
  textList: TextListItem[];
  buttonTitle?: string;
  buttonHref?: string;
}

export const TextListSection = (props: TextListProps) => {
  return (
    <Stack
      id={props.id}
      sx={{
        padding: "150px 0",
        alignItems: "center",
        width: "100%",

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
                variant="body1"
                sx={{ fontSize: "18px", lineHeight: 1.6, opacity: 0.9, paddingTop: "2px" }}
              >
                {item.title}
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
