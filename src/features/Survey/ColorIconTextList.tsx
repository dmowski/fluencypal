"use client";
import { Link, Stack, Typography } from "@mui/material";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

export interface ColorIconTextListItem {
  title: string;
  iconName?: IconName;
  href?: string;
  iconColor?: string;
}

export const ColorIconTextList = ({
  listItems,
  gap,
  iconSize,
}: {
  listItems: ColorIconTextListItem[];
  gap?: string;
  iconSize: string;
}) => {
  if (listItems.length === 0) {
    return null;
  }
  return (
    <Stack
      sx={{
        gap: gap || "18px",
        width: "100%",
      }}
    >
      {listItems.map((item, index) => {
        const iconStyle = {
          opacity: 1,
        };

        const iconSizeValue = iconSize || 18;
        return (
          <Stack
            key={index}
            sx={{
              flexDirection: "row",
              gap: "15px",
              alignItems: "center",
              width: "100%",
            }}
          >
            {item.iconName && (
              <DynamicIcon
                name={item.iconName}
                size={iconSizeValue}
                style={iconStyle}
                color={item.iconColor}
              />
            )}
            <Typography
              variant="body1"
              target={item.href ? "_blank" : undefined}
              component={item.href ? Link : "div"}
              href={item.href}
            >
              {item.title}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
};
