import { Stack, Typography } from "@mui/material";
import React from "react";
import { FaqItem, FaqItemInfo } from "./FaqItem";
import { titleFontStyle } from "../landingSettings";

interface GeneralFaqBlockProps {
  items: FaqItemInfo[];
  title: string;
}
export const GeneralFaqBlock = ({ items, title }: GeneralFaqBlockProps) => {
  return (
    <Stack
      sx={{
        width: "100%",
        padding: "120px 0 100px 0",
        alignItems: "center",
        justifyContent: "center",
        gap: "100px",
        backgroundColor: `#0a121e`,
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <Stack
        sx={{
          alignItems: "center",
          gap: "50px",
        }}
      >
        <Stack
          sx={{
            maxWidth: "890px",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <Typography
            align="center"
            variant="h3"
            component={"h2"}
            sx={{
              ...titleFontStyle,
            }}
          >
            {title}
          </Typography>
        </Stack>

        <Stack
          sx={{
            flexDirection: "column",
            gap: "0px",
            alignItems: "stretch",
            maxWidth: "800px",
            width: "100%",
          }}
        >
          {items.map((item, index) => (
            <FaqItem key={index} info={item} />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};
